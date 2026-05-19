# 🚀 Starting Services & Testing Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.9+ installed
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ Redis installed (or use Docker)
- ✅ PostgreSQL/Supabase database configured

## Step-by-Step Service Startup

### Step 1: Start Redis Server

**Option A: Using Docker (Easiest)**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option B: Native Installation**
```bash
# Windows (WSL)
wsl redis-server

# Linux
redis-server

# Mac
brew services start redis
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

---

### Step 2: Setup Backend Environment

Open **Terminal 1** (Backend):

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Create .env file (if not exists)
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Linux/Mac

# Edit .env file - IMPORTANT: Set your DATABASE_URL
# For Supabase: Get connection string from Supabase dashboard
# Format: postgresql://user:password@host:port/database
```

**Edit `.env` file with minimum required settings:**
```env
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

### Step 3: Setup Database & Run Migrations

Still in **Terminal 1**:

```bash
# Run migrations to create database tables
python manage.py migrate

# (Optional) Create admin user
python manage.py createsuperuser
# Follow prompts to create admin account
```

---

### Step 4: Start Celery Worker

Open **Terminal 2** (Celery Worker):

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

# Start Celery worker
celery -A policy_engine worker --pool=solo --loglevel=info
```

**Expected output:**
```
[tasks]
  . scanner.tasks.run_scan_task

[INFO/MainProcess] Connected to redis://localhost:6379/0
[INFO/MainProcess] celery@hostname ready.
```

**Keep this terminal open!** Celery worker must stay running.

---

### Step 5: Start Django Backend Server

Open **Terminal 3** (Django):

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

# Start Django development server
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Verify backend is running:**
- Open browser: http://localhost:8000/api/reports/
- Should see: `[]` (empty list, which is correct)

**Keep this terminal open!**

---

### Step 6: Start React Frontend

Open **Terminal 4** (Frontend):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open!**

---

## ✅ Testing Functionality

### Test 1: Frontend Access

1. Open browser: **http://localhost:5173**
2. You should see:
   - "DevSecOps Policy Engine" heading
   - Input form with "GitHub Repository URL" field
   - "Start Scan" button

### Test 2: API Health Check

Open browser: **http://localhost:8000/api/reports/**

Should return: `[]` (empty JSON array)

### Test 3: Admin Panel (Optional)

1. Open: **http://localhost:8000/admin/**
2. Login with superuser credentials
3. You should see "Scan Reports" section

### Test 4: Perform a Scan

1. **In the frontend** (http://localhost:5173):
   - Enter a GitHub repository URL:
     ```
     https://github.com/django/django
     ```
   - Click **"Start Scan"** button

2. **Watch Terminal 2 (Celery)**:
   - You should see task execution logs:
     ```
     [INFO] Cloning repository: https://github.com/django/django
     [INFO] Running CI Hygiene checks...
     [INFO] Running Code Quality checks...
     [INFO] Running Security checks...
     [INFO] Running Governance checks...
     [INFO] Scan completed successfully: 1
     ```

3. **Watch Terminal 3 (Django)**:
   - You should see API requests:
     ```
     POST /api/scan/
     GET /api/scan-status/1/
     ```

4. **Frontend should show**:
   - Loading spinner
   - Progress message
   - After 1-3 minutes: Results with score, risk level, and rule breakdown

### Test 5: View Results

After scan completes, you should see:
- ✅ **Compliance Score** (doughnut chart)
- ✅ **Risk Level** badge (Low/Medium/High)
- ✅ **Security Findings** panel
- ✅ **Rule Tables** for each module:
  - CI Hygiene
  - Code Quality
  - Security
  - Governance

### Test 6: Check Database

**Option A: Admin Panel**
- Go to: http://localhost:8000/admin/scanner/scanreport/
- See scan records with scores

**Option B: API**
- GET http://localhost:8000/api/reports/
- Should return JSON array with scan results

---

## 🔍 Troubleshooting

### Issue: "Celery connection refused"

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# If not running, start Redis:
docker run -d -p 6379:6379 redis:alpine
# OR
redis-server
```

### Issue: "Database connection failed"

**Solution:**
1. Check `.env` file has correct `DATABASE_URL`
2. Verify database credentials
3. Test connection:
   ```bash
   python manage.py dbshell
   ```

### Issue: "Module not found" errors

**Solution:**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "Port already in use"

**Solution:**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000
# Linux/Mac:
lsof -i :8000

# Kill process or change port:
python manage.py runserver 8001
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend is running on port 8000
2. Check `frontend/vite.config.js` proxy settings
3. Check CORS settings in `backend/policy_engine/settings.py`
4. Try direct API call: http://localhost:8000/api/reports/

### Issue: Scan fails immediately

**Check:**
1. Git is installed: `git --version`
2. Repository URL is accessible
3. Check Celery logs (Terminal 2) for errors
4. Check Django logs (Terminal 3) for errors

### Issue: Scan hangs or times out

**Solution:**
- Large repositories may take longer
- Check `SCAN_TIMEOUT` in settings.py (default: 60 seconds)
- Monitor Celery worker logs for progress

---

## 📊 Expected Scan Results

A successful scan should return:

```json
{
  "id": 1,
  "repo_url": "https://github.com/django/django",
  "repo_name": "django",
  "compliance_score": 75.5,
  "risk_level": "Medium",
  "scan_status": "completed",
  "report_json": {
    "ci_hygiene": {...},
    "code_quality": {...},
    "security": {...},
    "governance": {...},
    "score": 75.5,
    "risk_level": "Medium"
  }
}
```

---

## 🎯 Quick Test Checklist

- [ ] Redis running (`redis-cli ping` returns PONG)
- [ ] Celery worker running (Terminal 2)
- [ ] Django server running (Terminal 3, port 8000)
- [ ] Frontend running (Terminal 4, port 5173)
- [ ] Can access frontend: http://localhost:5173
- [ ] Can access API: http://localhost:8000/api/reports/
- [ ] Can submit scan request
- [ ] Scan completes successfully
- [ ] Results display correctly

---

## 🚀 Quick Start Script (Windows)

Create `start-all.bat`:

```batch
@echo off
echo Starting DevSecOps Policy Engine Services...

start "Redis" cmd /k "docker run -p 6379:6379 redis:alpine"
timeout /t 3

start "Celery" cmd /k "cd backend && venv\Scripts\activate && celery -A policy_engine worker --pool=solo --loglevel=info"
timeout /t 3

start "Django" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
timeout /t 3

start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services starting...
pause
```

---

## 📝 Service Summary

| Service | Port | Terminal | Status Check |
|---------|------|----------|--------------|
| Redis | 6379 | - | `redis-cli ping` |
| Celery Worker | - | Terminal 2 | Check logs |
| Django Backend | 8000 | Terminal 3 | http://localhost:8000/api/reports/ |
| React Frontend | 5173 | Terminal 4 | http://localhost:5173 |

---

## 🎉 Success Indicators

✅ All 4 terminals running without errors  
✅ Frontend loads at http://localhost:5173  
✅ API responds at http://localhost:8000/api/reports/  
✅ Scan completes and shows results  
✅ Score and risk level displayed  
✅ Rule breakdown tables populated  

**You're all set!** 🎊
