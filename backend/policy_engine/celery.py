"""
Celery configuration for policy_engine project.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'policy_engine.settings')

app = Celery('policy_engine')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
