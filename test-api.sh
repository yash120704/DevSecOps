#!/bin/bash

# API Testing Script
# Tests all endpoints to verify functionality

BASE_URL="http://localhost:8000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "API Functionality Test"
echo "========================================"
echo ""

# Test 1: Health Check - Get Reports
echo "[Test 1] GET /api/reports/"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/reports/")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Status: $http_code"
    echo "Response: $body"
else
    echo -e "${RED}✗ FAIL${NC} - Status: $http_code"
fi
echo ""

# Test 2: Initiate Scan
echo "[Test 2] POST /api/scan/"
test_repo="https://github.com/django/django"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/scan/" \
    -H "Content-Type: application/json" \
    -d "{\"repo_url\": \"$test_repo\"}")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 202 ] || [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Status: $http_code"
    echo "Response: $body"
    scan_id=$(echo "$body" | grep -o '"scan_id":[0-9]*' | grep -o '[0-9]*')
    echo "Scan ID: $scan_id"
else
    echo -e "${RED}✗ FAIL${NC} - Status: $http_code"
    echo "Response: $body"
fi
echo ""

# Test 3: Get Scan Status (if scan_id exists)
if [ ! -z "$scan_id" ]; then
    echo "[Test 3] GET /api/scan-status/$scan_id/"
    sleep 2
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL/scan-status/$scan_id/")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} - Status: $http_code"
        echo "Response: $body"
    else
        echo -e "${RED}✗ FAIL${NC} - Status: $http_code"
    fi
    echo ""
fi

# Test 4: Invalid URL
echo "[Test 4] POST /api/scan/ (Invalid URL)"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/scan/" \
    -H "Content-Type: application/json" \
    -d "{\"repo_url\": \"invalid-url\"}")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected invalid URL (Status: $http_code)"
else
    echo -e "${YELLOW}⚠ WARN${NC} - Expected 400, got $http_code"
fi
echo ""

echo "========================================"
echo "Test Complete"
echo "========================================"
