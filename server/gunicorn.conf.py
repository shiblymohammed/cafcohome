# Gunicorn production configuration
# Usage: gunicorn -c gunicorn.conf.py dravohome_api.wsgi:application

import multiprocessing
import os

# Server socket
bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:8000")

# Worker processes — 2-4 × CPU cores is the standard recommendation
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Restart workers after this many requests to prevent memory leaks
max_requests = 1000
max_requests_jitter = 100  # Randomise to avoid all workers restarting at once

# Logging
accesslog = os.environ.get("GUNICORN_ACCESS_LOG", "-")   # stdout
errorlog = os.environ.get("GUNICORN_ERROR_LOG", "-")     # stderr
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sµs'

# Process naming
proc_name = "dravohome_api"

# Security — don't expose gunicorn version
server_header = False
sendfile = True

# Graceful timeout for worker shutdown
graceful_timeout = 30
