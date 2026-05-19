# PowerShell API Testing Script
# Tests all endpoints to verify functionality

$BASE_URL = "http://localhost:8000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Functionality Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check - Get Reports
Write-Host "[Test 1] GET /api/reports/" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/reports/" -Method Get -ErrorAction Stop
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " - Status: 200"
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
    Write-Host " - Error: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: Initiate Scan
Write-Host "[Test 2] POST /api/scan/" -ForegroundColor Yellow
$testRepo = "https://github.com/django/django"
$body = @{
    repo_url = $testRepo
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/scan/" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
    Write-Host " - Status: 202"
    Write-Host "Response: $($response | ConvertTo-Json)"
    $scanId = $response.scan_id
    Write-Host "Scan ID: $scanId"
} catch {
    Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
    Write-Host " - Error: $($_.Exception.Message)"
    $scanId = $null
}
Write-Host ""

# Test 3: Get Scan Status
if ($scanId) {
    Write-Host "[Test 3] GET /api/scan-status/$scanId/" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/scan-status/$scanId/" -Method Get -ErrorAction Stop
        Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
        Write-Host " - Status: 200"
        Write-Host "Scan Status: $($response.scan_status)"
        Write-Host "Compliance Score: $($response.compliance_score)"
    } catch {
        Write-Host "✗ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " - Error: $($_.Exception.Message)"
    }
    Write-Host ""
}

# Test 4: Invalid URL
Write-Host "[Test 4] POST /api/scan/ (Invalid URL)" -ForegroundColor Yellow
$invalidBody = @{
    repo_url = "invalid-url"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/scan/" -Method Post -Body $invalidBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "⚠ WARN" -ForegroundColor Yellow -NoNewline
    Write-Host " - Should have rejected invalid URL"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✓ PASS" -ForegroundColor Green -NoNewline
        Write-Host " - Correctly rejected invalid URL (Status: 400)"
    } else {
        Write-Host "⚠ WARN" -ForegroundColor Yellow -NoNewline
        Write-Host " - Unexpected error: $($_.Exception.Message)"
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
