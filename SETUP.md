# Setup Guide

## Prerequisites Installation

### Python 3.9+
Download from [python.org](https://www.python.org/downloads/)

### Node.js 18+
Download from [nodejs.org](https://nodejs.org/)

### PostgreSQL / Supabase
- Option 1: Install PostgreSQL locally
- Option 2: Use Supabase (recommended): [supabase.com](https://supabase.com)

### Redis
- **Windows**: Use WSL or download from [redis.io](https://redis.io/download)
- **Linux**: `sudo apt-get install redis-server` or `brew install redis` (Mac)
- **Mac**: `brew install redis`

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file with your settings:
# - DATABASE_URL from Supabase
# - SECRET_KEY (generate a new one)
# - CELERY_BROKER_URL (default: redis://localhost:6379/0)
```

### 2. Database Setup

#### Using Supabase:
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (URI format)
5. Paste into `.env` as `DATABASE_URL`

#### Using Local PostgreSQL:
```bash
# Create database
createdb devsecops_policy_engine

# Update .env
DATABASE_URL=postgresql://username:password@localhost:5432/devsecops_policy_engine
```

### 3. Run Migrations

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser  # Optional: for admin access
```

### 4. Start Redis

```bash
# Linux/Mac
redis-server

# Windows (WSL)
wsl redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### 5. Start Celery Worker

```bash
cd backend
celery -A policy_engine worker --pool=solo --loglevel=info
```

Keep this terminal open!

### 6. Start Django Server

```bash
cd backend
python manage.py runserver
```

Server runs on `http://localhost:8000`

### 7. Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Verification

1. Open browser to `http://localhost:5173`
2. Enter a GitHub repository URL (e.g., `https://github.com/django/django`)
3. Click "Start Scan"
4. Wait for scan to complete (may take 1-3 minutes)
5. View results!

## Troubleshooting

### Celery not connecting to Redis
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check `CELERY_BROKER_URL` in `.env`

### Database connection errors
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Ensure database exists
- Check network connectivity to Supabase

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check CORS settings in `backend/policy_engine/settings.py`
- Verify proxy settings in `frontend/vite.config.js`

### Scan fails immediately
- Check Git is installed: `git --version`
- Verify repository URL is accessible
- Check logs in Django console

### Tools not found (flake8, radon, pip-audit)
- These are optional - scans will still work but show warnings
- Install globally: `pip install flake8 radon pip-audit`
- Or add to requirements.txt and reinstall

## Production Deployment

### Environment Variables
Set these in production:
- `SECRET_KEY`: Generate strong secret key
- `DEBUG=False`
- `ALLOWED_HOSTS`: Your domain
- `DATABASE_URL`: Production database
- `CELERY_BROKER_URL`: Production Redis

### Static Files
```bash
python manage.py collectstatic
```

### Run Migrations
```bash
python manage.py migrate
```

### Process Management
Use systemd, supervisor, or PM2 for:
- Django (Gunicorn/uWSGI)
- Celery worker
- Redis

## Next Steps

- Configure additional rules in check modules
- Adjust scoring weights in `scoring_engine.py`
- Add authentication (JWT tokens)
- Set up monitoring and alerts
- Configure CI/CD pipeline
