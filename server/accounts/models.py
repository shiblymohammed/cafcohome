from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for User model."""
    
    def create_user(self, email, password=None, name='', phone_number='', address='', pin_code='', area='', district='', state='', **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            name=name,
            phone_number=phone_number,
            address=address,
            pin_code=pin_code,
            area=area,
            district=district,
            state=state,
            **extra_fields
        )
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
            
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    """Customer user model with Email/Password authentication."""
    
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=15, blank=True, default='')
    
    # Address fields
    address = models.TextField(blank=True, default='')  # Street address
    pin_code = models.CharField(max_length=6, blank=True, default='')
    area = models.CharField(max_length=200, blank=True, default='')  # Post office/locality
    district = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    
    is_blocked = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Required for Django admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Fix related_name clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='customer_users',
        related_query_name='customer_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='customer_users',
        related_query_name='customer_user',
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class StaffManager(BaseUserManager):
    """Custom manager for Staff model."""
    
    def create_staff(self, username, password, name, phone_number, role='staff', **extra_fields):
        """Create and save a Staff user."""
        if not username:
            raise ValueError('The Username field must be set')
        
        staff = self.model(
            username=username,
            name=name,
            phone_number=phone_number,
            role=role,
            **extra_fields
        )
        staff.set_password(password)
        staff.save(using=self._db)
        return staff
    
    def create_superuser(self, username, password, name, phone_number, **extra_fields):
        """Create and save a superuser (admin)."""
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_staff(username, password, name, phone_number, **extra_fields)


class Staff(AbstractBaseUser, PermissionsMixin):
    """Staff and admin user model with username/password authentication."""
    
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    ]
    
    username = models.CharField(max_length=150, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=15)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='staff')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Required for Django admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)
    
    # Fix related_name clashes
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='staff_users',
        related_query_name='staff_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='staff_users',
        related_query_name='staff_user',
    )
    
    objects = StaffManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['name', 'phone_number']
    
    class Meta:
        db_table = 'staff'
        verbose_name = 'Staff'
        verbose_name_plural = 'Staff'
    
    def __str__(self):
        return f"{self.name} ({self.username}) - {self.role}"
    
    @property
    def is_admin(self):
        """Check if staff member is an admin."""
        return self.role == 'admin'
