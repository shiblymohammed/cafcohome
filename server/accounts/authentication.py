"""
Custom Authentication Classes

Provides authentication for User and Staff using custom token models.
Tokens expire after TOKEN_EXPIRY_DAYS (default 30 days).
"""

from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from rest_framework import authentication, exceptions
from .tokens import UserToken, StaffToken


def _token_is_expired(token):
    """Return True if the token is older than TOKEN_EXPIRY_DAYS."""
    expiry_days = getattr(settings, 'TOKEN_EXPIRY_DAYS', 30)
    if expiry_days <= 0:
        return False  # 0 = never expire
    cutoff = timezone.now() - timedelta(days=expiry_days)
    return token.created < cutoff


class UserTokenAuthentication(authentication.BaseAuthentication):
    """
    Token-based authentication for User (customers) using UserToken model.

    Header format:
        Authorization: Bearer <token>
    """

    keyword = 'Bearer'
    model = UserToken

    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        if len(auth) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        try:
            token = auth[1].decode()
        except UnicodeError:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string contains invalid characters.')

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.select_related('user').get(key=key)
        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')

        if token.user.is_blocked:
            raise exceptions.AuthenticationFailed('User account is blocked.')

        if _token_is_expired(token):
            token.delete()
            raise exceptions.AuthenticationFailed('Token has expired. Please log in again.')

        return (token.user, token)

    def authenticate_header(self, request):
        return self.keyword


class StaffTokenAuthentication(authentication.BaseAuthentication):
    """
    Token-based authentication for Staff users using StaffToken model.

    Header format:
        Authorization: Token <token>
    """

    keyword = 'Token'
    model = StaffToken

    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        if len(auth) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        try:
            token = auth[1].decode()
        except UnicodeError:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string contains invalid characters.')

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.select_related('staff').get(key=key)
        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')

        if not token.staff.is_active:
            raise exceptions.AuthenticationFailed('Staff account is inactive.')

        if _token_is_expired(token):
            token.delete()
            raise exceptions.AuthenticationFailed('Token has expired. Please log in again.')

        return (token.staff, token)

    def authenticate_header(self, request):
        return self.keyword
