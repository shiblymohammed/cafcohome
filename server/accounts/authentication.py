"""
Custom Authentication Classes

Provides authentication for User and Staff using custom token models
"""

from rest_framework import authentication, exceptions
from .tokens import UserToken, StaffToken


class UserTokenAuthentication(authentication.BaseAuthentication):
    """
    Token-based authentication for User (customers) using UserToken model.
    
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Bearer ".  For example:
    
        Authorization: Bearer 401f7ac837da42b97f613d789819ff93537bee6a
    """
    
    keyword = 'Bearer'
    model = UserToken
    
    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()
        
        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None
        
        if len(auth) == 1:
            msg = 'Invalid token header. No credentials provided.'
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = 'Invalid token header. Token string should not contain spaces.'
            raise exceptions.AuthenticationFailed(msg)
        
        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = 'Invalid token header. Token string should not contain invalid characters.'
            raise exceptions.AuthenticationFailed(msg)
        
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.select_related('user').get(key=key)
        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')
        
        if token.user.is_blocked:
            raise exceptions.AuthenticationFailed('User account is blocked.')
        
        return (token.user, token)
    
    def authenticate_header(self, request):
        return self.keyword


class StaffTokenAuthentication(authentication.BaseAuthentication):
    """
    Token-based authentication for Staff users using StaffToken model.
    
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Token ".  For example:
    
        Authorization: Token 401f7ac837da42b97f613d789819ff93537bee6a
    """
    
    keyword = 'Token'
    model = StaffToken
    
    def authenticate(self, request):
        auth = authentication.get_authorization_header(request).split()
        
        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None
        
        if len(auth) == 1:
            msg = 'Invalid token header. No credentials provided.'
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = 'Invalid token header. Token string should not contain spaces.'
            raise exceptions.AuthenticationFailed(msg)
        
        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = 'Invalid token header. Token string should not contain invalid characters.'
            raise exceptions.AuthenticationFailed(msg)
        
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        try:
            token = self.model.objects.select_related('staff').get(key=key)
        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')
        
        if not token.staff.is_active:
            raise exceptions.AuthenticationFailed('User inactive or deleted.')
        
        return (token.staff, token)
    
    def authenticate_header(self, request):
        return self.keyword
