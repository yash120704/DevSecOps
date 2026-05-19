"""
WSGI config for policy_engine project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'policy_engine.settings')

application = get_wsgi_application()
