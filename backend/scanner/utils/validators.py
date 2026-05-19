"""
Input validation utilities.
"""
import re
from urllib.parse import urlparse
from django.conf import settings


def validate_github_url(url: str) -> tuple[bool, str]:
    """
    Validate GitHub repository URL.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not url:
        return False, "URL is required"
    
    try:
        parsed = urlparse(url)
        
        # Check scheme
        if parsed.scheme not in ['http', 'https']:
            return False, "URL must use http or https"
        
        # Check hostname
        if parsed.hostname not in settings.ALLOWED_GIT_HOSTS:
            return False, f"Only repositories from {', '.join(settings.ALLOWED_GIT_HOSTS)} are allowed"
        
        # Check path format (should be /username/repo)
        path_parts = [p for p in parsed.path.split('/') if p]
        if len(path_parts) < 2:
            return False, "Invalid repository path format"
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'\.\.',  # Path traversal
            r'[<>"\'`]',  # Injection attempts
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, url):
                return False, "URL contains suspicious characters"
        
        return True, ""
        
    except Exception as e:
        return False, f"Invalid URL format: {str(e)}"
