# Test API Script - Create Riders and Orders
# Run this: .\test-orders.ps1

$apiKey = "tk_14a350c944e9145a0e79c8b7e87085c62698b842dbc9ba68b75ccb56283ca119"
$baseUrl = "http://localhost:3000/api/v1"

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTING TOOKAN API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. CREATE RIDERS
Write-Host ""
Write-Host "[1] CREATING RIDERS..." -ForegroundColor Yellow

$riders = @(
    @{
        name = "Ahmed Al-Otaibi"
        phone = "+966501234567"
        email = "ahmed@test.com"
        vehicle_type = "motorcycle"
    },
    @{
        name = "Mohammed Al-Dossari"
        phone = "+966502345678"
        email = "mohammed@test.com"
        vehicle_type = "car"
    },
    @{
        name = "Fahad Al-Sabhan"
        phone = "+966503456789"
        email = "fahad@test.com"
        vehicle_type = "van"
    }
)

$riderIds = @()

foreach ($rider in $riders) {
    $body = $rider | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/riders" -Method POST -Headers $headers -Body $body
        if ($response.data.id) {
            $riderIds += $response.data.id
            $riderId = $response.data.id
            Write-Host "[OK] Created rider - $($rider.name)" -ForegroundColor Green
            Write-Host "     Rider ID = $riderId" -ForegroundColor Gray
        } else {
            Write-Host "[WARN] No ID returned for - $($rider.name)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[FAIL] Could not create rider - $($rider.name)" -ForegroundColor Red
        Write-Host "       Error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. CREATE ORDERS (only if we have riders)
Write-Host ""
Write-Host "[2] CREATING ORDERS..." -ForegroundColor Yellow

if ($riderIds.Count -eq 0) {
    Write-Host "[SKIP] No riders created, creating orders without assignment" -ForegroundColor Yellow
}

$orders = @(
    @{
        pickup_address = "123 Main Street, Riyadh"
        pickup_lat = 24.7136
        pickup_lng = 46.6753
        delivery_address = "456 King Fahd Road, Riyadh"
        delivery_lat = 24.7500
        delivery_lng = 46.7000
        customer_name = "Ali Mohammed"
        customer_phone = "+966509876543"
    },
    @{
        pickup_address = "789 Prince Sultan Street, Riyadh"
        pickup_lat = 24.7200
        pickup_lng = 46.6800
        delivery_address = "321 Olaya Street, Riyadh"
        delivery_lat = 24.7400
        delivery_lng = 46.6900
        customer_name = "Fatima Ahmed"
        customer_phone = "+966505555555"
    },
    @{
        pickup_address = "555 Tahlia Street, Riyadh"
        pickup_lat = 24.7100
        pickup_lng = 46.7100
        delivery_address = "999 Al-Nakheel District, Riyadh"
        delivery_lat = 24.7300
        delivery_lng = 46.7200
        customer_name = "Hassan Abdullah"
        customer_phone = "+966501111111"
    },
    @{
        pickup_address = "100 Takhassusi Street, Riyadh"
        pickup_lat = 24.7050
        pickup_lng = 46.6750
        delivery_address = "200 Diplomatic Quarter, Riyadh"
        delivery_lat = 24.7350
        delivery_lng = 46.7350
        customer_name = "Sara Ibrahim"
        customer_phone = "+966502222222"
    }
)

# Assign riders if available
if ($riderIds.Count -gt 0) {
    $orders[0].rider_id = $riderIds[0]
    if ($riderIds.Count -gt 1) { $orders[1].rider_id = $riderIds[1] }
    if ($riderIds.Count -gt 2) { $orders[2].rider_id = $riderIds[2] }
    if ($riderIds.Count -gt 0) { $orders[3].rider_id = $riderIds[0] }
}

$orderNum = 1
foreach ($order in $orders) {
    $body = $order | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/orders" -Method POST -Headers $headers -Body $body
        if ($response.data.id) {
            $orderId = $response.data.id
            Write-Host "[OK] Order $orderNum - $($order.customer_name) to $($order.delivery_address)" -ForegroundColor Green
            Write-Host "     Order ID = $orderId" -ForegroundColor Gray
        } else {
            Write-Host "[WARN] No ID returned for order $orderNum" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[FAIL] Could not create order $orderNum" -ForegroundColor Red
        Write-Host "       Error - $($_.Exception.Message)" -ForegroundColor Red
    }
    $orderNum++
}

# 3. GET ALL ORDERS
Write-Host ""
Write-Host "[3] FETCHING ALL ORDERS..." -ForegroundColor Yellow
try {
    $allOrders = Invoke-RestMethod -Uri "$baseUrl/orders" -Headers $headers
    $orderCount = 0
    if ($allOrders.data) { $orderCount = $allOrders.data.Count }
    Write-Host "[OK] Total Orders = $orderCount" -ForegroundColor Green
    
    if ($allOrders.data) {
        foreach ($order in $allOrders.data) {
            Write-Host "     - $($order.customer_name) | Status - $($order.status)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "[FAIL] Could not fetch orders" -ForegroundColor Red
    Write-Host "       Error - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. GET ALL RIDERS
Write-Host ""
Write-Host "[4] FETCHING ALL RIDERS..." -ForegroundColor Yellow
try {
    $allRiders = Invoke-RestMethod -Uri "$baseUrl/riders" -Headers $headers
    $riderCount = 0
    if ($allRiders.data) { $riderCount = $allRiders.data.Count }
    Write-Host "[OK] Total Riders = $riderCount" -ForegroundColor Green
    
    if ($allRiders.data) {
        foreach ($rider in $allRiders.data) {
            Write-Host "     - $($rider.name) | Phone - $($rider.phone)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "[FAIL] Could not fetch riders" -ForegroundColor Red
    Write-Host "       Error - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE!" -ForegroundColor Cyan
Write-Host "Check your dashboard at:" -ForegroundColor Yellow
Write-Host "http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
