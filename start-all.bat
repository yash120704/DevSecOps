@echo off
echo ========================================
echo DevSecOps Policy Engine - Service Starter
echo ========================================
echo.

echo [1/4] Checking Redis...
docker ps | findstr redis >nul
if %errorlevel% neq 0 (
    echo Starting Redis container...
    start "Redis" cmd /k "docker run -p 6379:6379 --name redis redis:alpine"
    timeout /t 5
) else (
    echo Redis already running
)

echo [2/4] Starting Celery Worker...
cd backend
if not exist venv (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)
start "Celery Worker" cmd /k "venv\Scripts\activate && celery -A policy_engine worker --pool=solo --loglevel=info"
cd ..
timeout /t 3

echo [3/4] Starting Django Backend...
cd backend
start "Django Server" cmd /k "venv\Scripts\activate && python manage.py runserver"
cd ..
timeout /t 3

echo [4/4] Starting React Frontend...
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
start "React Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:8000
echo Admin:     http://localhost:8000/admin
echo.
echo Press any key to open frontend in browser...
pause >nul
start http://localhost:5173
