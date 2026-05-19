"""
Authentication views for Supabase integration.
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from .auth_serializers import RegisterSerializer, LoginSerializer
from .services.supabase_client import supabase

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint.
    Expected POST data: {email, password}
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        result = supabase.register_user(email, password)
        
        return Response({
            'success': True,
            'message': 'Registration successful. Please check your email to confirm.',
            'user': result.get('user'),
            'session': result.get('session')
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint.
    Expected POST data: {email, password}
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        result = supabase.login_user(email, password)
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': result.get('user'),
            'session': result.get('session')
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return Response({
            'success': False,
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Logout endpoint. Client-side token cleanup is handled by frontend.
    This endpoint exists for audit logging and future session management.
    """
    try:
        # In a real implementation, could invalidate tokens server-side
        # For now, the JWT token becomes invalid on the frontend
        return Response({
            'success': True,
            'message': 'Logout successful. Please clear local tokens.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh access token using refresh token.
    Expected POST data: {refresh_token}
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({
                'error': 'refresh_token required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Use Supabase client to refresh token
        response = supabase.client.auth.refresh_session(refresh_token)
        
        return Response({
            'success': True,
            'session': {
                'access_token': response.session.access_token,
                'refresh_token': response.session.refresh_token
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return Response({
            'success': False,
            'error': 'Failed to refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_token_view(request):
    """
    Verify current session token.
    Requires Authorization header with Bearer token.
    """
    try:
        user_data = request.auth  # Set by authentication middleware
        return Response({
            'success': True,
            'user': user_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return Response({
            'success': False,
            'error': 'Token verification failed'
        }, status=status.HTTP_401_UNAUTHORIZED)
