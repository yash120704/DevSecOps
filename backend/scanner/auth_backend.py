"""
Authentication middleware for Supabase JWT token verification.
"""
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .services.supabase_client import supabase

logger = logging.getLogger(__name__)


class SupabaseJWTAuthentication(TokenAuthentication):
    """
    Custom authentication class for Supabase JWT tokens.
    Validates Bearer token and extracts user information.
    """
    
    keyword = 'Bearer'

    class AuthenticatedUser:
        """Lightweight user object compatible with DRF IsAuthenticated."""

        def __init__(self, user_data):
            self.id = user_data.get('user_id')
            self.email = user_data.get('email')
            self.user_metadata = user_data.get('user_metadata', {})
            self.is_authenticated = True
    
    def authenticate_credentials(self, key):
        """
        Authenticate the token key and return user data.
        
        Args:
            key: JWT token string
            
        Returns:
            Tuple of (user_data, token)
        """
        try:
            user_data = supabase.verify_token(key)
            user = self.AuthenticatedUser(user_data)
            # request.user -> lightweight authenticated user
            # request.auth -> verified auth payload used by views
            return (user, user_data)
        except Exception as e:
            logger.debug(f"Token authentication failed: {e}")
            raise AuthenticationFailed('Invalid or expired token')


class SupabaseAuthMiddleware(MiddlewareMixin):
    """
    Middleware to attach Supabase user info to request if valid token present.
    """
    
    EXEMPT_PATHS = [
        '/api/auth/register/',
        '/api/auth/login/',
        '/api/auth/logout/',
        '/api/auth/refresh/',
        '/admin/',
        '/api/schema/',
    ]
    
    def process_request(self, request):
        """
        Extract and verify token from Authorization header.
        """
        # Skip auth for exempt paths
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None
        
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            # If token not provided and endpoint requires auth, will be caught
            # by API view permissions
            return None
        
        try:
            token = auth_header.split(' ')[1]
            user_data = supabase.verify_token(token)
            
            # Attach user data to request
            request.user = type('User', (), {
                'id': user_data.get('user_id'),
                'email': user_data.get('email'),
                'user_metadata': user_data.get('user_metadata', {}),
                'is_authenticated': True,
            })()
            request.auth = user_data
            
        except Exception as e:
            logger.debug(f"Auth middleware error: {e}")
            # Don't fail here; let the view handle it based on permissions
            pass
        
        return None
