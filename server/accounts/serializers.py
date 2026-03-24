from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Staff


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone_number', 'address', 'pin_code', 'area', 'district', 'state', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone_number', 'address', 'pin_code', 'area', 'district', 'state']
    
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google authentication."""
    
    access_token = serializers.CharField(required=True)


class StaffLoginSerializer(serializers.Serializer):
    """Serializer for staff/admin login."""
    
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        """Validate credentials and authenticate staff."""
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            staff = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not staff:
                raise serializers.ValidationError('Invalid credentials')
            
            if not staff.is_active:
                raise serializers.ValidationError('Account is inactive')
            
            data['staff'] = staff
            return data
        else:
            raise serializers.ValidationError('Must include username and password')


class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff model."""
    
    class Meta:
        model = Staff
        fields = ['id', 'username', 'name', 'phone_number', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class StaffCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating staff accounts."""
    
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    class Meta:
        model = Staff
        fields = ['username', 'password', 'name', 'phone_number', 'role']
    
    def create(self, validated_data):
        """Create a new staff member."""
        staff = Staff.objects.create_staff(
            username=validated_data['username'],
            password=validated_data['password'],
            name=validated_data['name'],
            phone_number=validated_data['phone_number'],
            role=validated_data.get('role', 'staff')
        )
        return staff
