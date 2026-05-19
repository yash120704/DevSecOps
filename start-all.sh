#!/bin/bash

echo "========================================"
echo "DevSecOps Policy Engine - Service Starter"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Redis
echo "[1/4] Checking Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}Redis not running. Starting Redis...${NC}"
    if command -v docker &> /dev/null; then
        docker run -d -p 6379:6379 --name redis redis:alpine
        sleep 3
    else
        echo -e "${RED}Docker not found. Please start Redis manually: redis-server${NC}"
    fi
else
    echo -e "${GREEN}Redis is running${NC}"
fi

# Start Celery Worker
echo "[2/4] Starting Celery Worker..."
cd backend
if [ ! -d "venv" ]; then
    echo -e "${RED}ERROR: Virtual environment not found!${NC}"
    echo "Please run: python -m venv venv"
    exit 1
fi
source venv/bin/activate
gnome-terminal -- bash -c "cd $(pwd) && source venv/bin/activate && celery -A policy_engine worker --pool=solo --loglevel=info; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && source venv/bin/activate && celery -A policy_engine worker --pool=solo --loglevel=info" 2>/dev/null || \
echo "Please start Celery manually: cd backend && source venv/bin/activate && celery -A policy_engine worker --pool=solo --loglevel=info"
cd ..
sleep 2

# Start Django Backend
echo "[3/4] Starting Django Backend..."
cd backend
gnome-terminal -- bash -c "cd $(pwd) && source venv/bin/activate && python manage.py runserver; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && source venv/bin/activate && python manage.py runserver" 2>/dev/null || \
echo "Please start Django manually: cd backend && source venv/bin/activate && python manage.py runserver"
cd ..
sleep 2

# Start React Frontend
echo "[4/4] Starting React Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd $(pwd) && npm run dev" 2>/dev/null || \
echo "Please start Frontend manually: cd frontend && npm run dev"
cd ..

echo ""
echo "========================================"
echo "All services are starting!"
echo "========================================"
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:8000"
echo "Admin:     http://localhost:8000/admin"
echo ""
echo -e "${GREEN}Opening frontend in browser...${NC}"
sleep 2

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
fi
