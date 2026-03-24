from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Staff


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin interface for User model."""
    
    list_display = ('email', 'name', 'phone_number', 'is_blocked', 'created_at')
    list_filter = ('is_blocked', 'created_at')
    search_fields = ('email', 'name', 'phone_number')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'phone_number', 'address')}),
        ('Status', {'fields': ('is_blocked', 'is_active', 'is_staff')}),
        ('Groups', {'fields': ('groups', 'user_permissions')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Staff)
class StaffAdmin(BaseUserAdmin):
    """Admin interface for Staff model."""
    
    list_display = ('username', 'name', 'role', 'phone_number', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'name', 'phone_number')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('name', 'phone_number')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'name', 'phone_number', 'role'),
        }),
    )
