"""
Custom Token Management

Since we have two separate user models (User and Staff), we can't use Django's
built-in Token model which requires a single AUTH_USER_MODEL.
"""

import binascii
import os
from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserToken(models.Model):
    """
    Token model for User (customer) authentication.
    """
    key = models.CharField(max_length=40, primary_key=True)
    user = models.OneToOneField(
        'accounts.User',
        related_name='auth_token',
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_tokens'
        verbose_name = 'User Token'
        verbose_name_plural = 'User Tokens'
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)
    
    @classmethod
    def generate_key(cls):
        return binascii.hexlify(os.urandom(20)).decode()
    
    def __str__(self):
        return self.key


class StaffToken(models.Model):
    """
    Token model for Staff authentication.
    """
    key = models.CharField(max_length=40, primary_key=True)
    staff = models.OneToOneField(
        'accounts.Staff',
        related_name='auth_token',
        on_delete=models.CASCADE
    )
    created = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'staff_tokens'
        verbose_name = 'Staff Token'
        verbose_name_plural = 'Staff Tokens'
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        return super().save(*args, **kwargs)
    
    @classmethod
    def generate_key(cls):
        return binascii.hexlify(os.urandom(20)).decode()
    
    def __str__(self):
        return self.key
