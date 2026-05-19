"""
Gunicorn configuration for DevSecOps backend.
Sets worker timeout to allow long-running scans.
"""
import multiprocessing
import os

# Worker configuration
workers = max(2, multiprocessing.cpu_count() // 2)
worker_class = "sync"

# Timeout: 300 seconds (5 minutes) to allow long scans
timeout = 300

# Worker connections
max_requests = 1000
max_requests_jitter = 100

# Server socket
bind = f"0.0.0.0:{os.environ.get('PORT', 8000)}"
backlog = 2048

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (if needed in production)
keyfile = None
certfile = None

# Application
forwarded_allow_ips = "*"
secure_scheme_header = "X-FORWARDED-PROTO"
