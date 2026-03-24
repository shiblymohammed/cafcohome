from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from .models import User, Staff
from .tokens import StaffToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    StaffLoginSerializer,
    StaffSerializer,
    StaffCreateSerializer
)
from .contact_serializers import ContactFormSerializer


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user with email and password."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create token
            from .tokens import UserToken
            token, _ = UserToken.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        
        return Response(
            {
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Invalid input data',
                    'details': serializer.errors
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class UserLoginView(APIView):
    """Login with email and password."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if not user:
            return Response(
                {
                    'error': {
                        'code': 'AUTHENTICATION_ERROR',
                        'message': 'Invalid email or password'
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        if user.is_blocked:
            return Response(
                {
                    'error': {
                        'code': 'AUTHENTICATION_ERROR',
                        'message': 'Account is blocked'
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Create token
        from .tokens import UserToken
        token, _ = UserToken.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    """Authenticate with Google Access Token."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        from .serializers import GoogleAuthSerializer
        import requests
        
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        access_token = serializer.validated_data['access_token']
        
        # Verify token with Google
        try:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                params={'access_token': access_token}
            )
            
            if not google_response.ok:
                return Response(
                    {
                        'error': {
                            'code': 'AUTHENTICATION_ERROR',
                            'message': 'Invalid Google token'
                        }
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            user_data = google_response.json()
            email = user_data.get('email')
            name = user_data.get('name')
            
            if not email:
                return Response(
                    {
                        'error': {
                            'code': 'AUTHENTICATION_ERROR',
                            'message': 'Google account must have an email'
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Get or create user
            user = None
            is_new_user = False
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                user = User.objects.create_user(
                    email=email,
                    name=name,
                    password=None # Unusable password
                )
                is_new_user = True
                
            if user.is_blocked:
                return Response(
                    {
                        'error': {
                            'code': 'AUTHENTICATION_ERROR',
                            'message': 'Account is blocked'
                        }
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Create token
            from .tokens import UserToken
            token, _ = UserToken.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'Login successful',
                'is_new_user': is_new_user
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {
                    'error': {
                        'code': 'INTERNAL_ERROR',
                        'message': 'Failed to authenticate with Google'
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StaffLoginView(APIView):
    """Login endpoint for admin and staff users."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = StaffLoginSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        staff = serializer.validated_data['staff']
        login(request, staff)
        
        # Create or get staff token
        token, created = StaffToken.objects.get_or_create(staff=staff)
        
        return Response({
            'staff': StaffSerializer(staff).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout endpoint for all user types."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Delete token
        try:
            request.user.auth_token.delete()
        except:
            pass
        
        # Logout
        logout(request)
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


class StaffCreateView(generics.CreateAPIView):
    """Create new staff accounts (admin only)."""
    
    queryset = Staff.objects.all()
    serializer_class = StaffCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Check if user is admin
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can create staff accounts')
        
        serializer.save()


class StaffListView(generics.ListAPIView):
    """List all staff members (admin only)."""
    
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user is admin
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can view staff list')
        
        return Staff.objects.all().order_by('-created_at')


class UserListView(generics.ListAPIView):
    """List all users (admin only)."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user is admin
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can view user list')
        
        queryset = User.objects.all().order_by('-created_at')
        
        # Filter by blocked status
        is_blocked = self.request.query_params.get('is_blocked', None)
        if is_blocked is not None:
            queryset = queryset.filter(is_blocked=is_blocked.lower() == 'true')
        
        # Search by name or phone
        search = self.request.query_params.get('search', None)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(phone_number__icontains=search)
            )
        
        return queryset


class UserDetailView(generics.RetrieveAPIView):
    """Retrieve user detail with order history (admin only)."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Check if user is admin
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins can view user details')
        
        return User.objects.all()


class UserBlockView(APIView):
    """Block a user (admin only)."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        # Check if user is admin
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response(
                {
                    'error': {
                        'code': 'AUTHORIZATION_ERROR',
                        'message': 'Only admins can block users'
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'User not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        user.is_blocked = True
        user.save()
        
        return Response(
            {
                'user': UserSerializer(user).data,
                'message': 'User blocked successfully'
            },
            status=status.HTTP_200_OK
        )


class UserUnblockView(APIView):
    """Unblock a user (admin only)."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        # Check if user is admin
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response(
                {
                    'error': {
                        'code': 'AUTHORIZATION_ERROR',
                        'message': 'Only admins can unblock users'
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'User not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        user.is_blocked = False
        user.save()
        
        return Response(
            {
                'user': UserSerializer(user).data,
                'message': 'User unblocked successfully'
            },
            status=status.HTTP_200_OK
        )


class UserDeleteView(generics.DestroyAPIView):
    """Delete a user (admin only)."""
    
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        # Check if user is admin
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response(
                {
                    'error': {
                        'code': 'AUTHORIZATION_ERROR',
                        'message': 'Only admins can delete users'
                    }
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        instance = self.get_object()
        instance.delete()
        
        return Response(
            {
                'message': 'User deleted successfully'
            },
            status=status.HTTP_200_OK
        )


class ContactFormView(APIView):
    """Submit contact form."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ContactFormSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'Invalid input data',
                        'details': serializer.errors
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            serializer.save()
            
            return Response(
                {
                    'message': 'Thank you for contacting us. We will get back to you soon.'
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    'error': {
                        'code': 'INTERNAL_ERROR',
                        'message': 'Failed to send message. Please try again later.'
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    """Get and update user profile."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile."""
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    def patch(self, request):
        """Update user profile."""
        user = request.user
        
        # Only allow updating certain fields
        allowed_fields = ['name', 'phone_number', 'address', 'pin_code', 'area', 'district', 'state']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if not update_data:
            return Response(
                {
                    'error': {
                        'code': 'VALIDATION_ERROR',
                        'message': 'No valid fields to update'
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user fields
        for field, value in update_data.items():
            setattr(user, field, value)
        
        try:
            user.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Profile updated successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {
                    'error': {
                        'code': 'UPDATE_ERROR',
                        'message': str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PincodeLookupView(APIView):
    """Look up district and state for a given pincode."""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, pincode):
        """Get district and state for pincode."""
        from .pincode_utils import lookup_pincode
        
        result = lookup_pincode(pincode)
        
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    'error': {
                        'code': 'NOT_FOUND',
                        'message': 'Invalid pincode or pincode not found'
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )
