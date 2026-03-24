from django.contrib.auth.backends import BaseBackend
from .models import User, Staff


class UserAuthBackend(BaseBackend):
    """Authentication backend for User model with email/password."""
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authenticate user by email and password."""
        if username is None or password is None:
            return None
        
        try:
            # username parameter actually contains the email
            user = User.objects.get(email=username)
            if user.check_password(password) and user.is_active and not user.is_blocked:
                return user
            return None
        except User.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        """Get user by ID."""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class StaffAuthBackend(BaseBackend):
    """Authentication backend for Staff model with username/password."""
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """Authenticate staff by username and password."""
        if username is None or password is None:
            return None
        
        try:
            staff = Staff.objects.get(username=username)
            if staff.check_password(password) and staff.is_active:
                return staff
            return None
        except Staff.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        """Get staff by ID."""
        try:
            return Staff.objects.get(pk=user_id)
        except Staff.DoesNotExist:
            return None
