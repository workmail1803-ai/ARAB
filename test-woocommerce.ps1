# Test WooCommerce Webhook - Simulates orders from WordPress store
# Run this: .\test-woocommerce.ps1

$webhookUrl = "http://localhost:3000/api/webhooks/woocommerce"
$apiKey = "tk_df8322331135bf32b7ba4212b0255abe115a6815c4e1ae61ebd9a7e7e3e3173b"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTING WOOCOMMERCE WEBHOOK" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Simulate 3 WooCommerce orders
$orders = @(
    @{
        id = 10001
        status = "processing"
        total = "149.99"
        currency = "SAR"
        customer_note = "Please call before delivery"
        payment_method = "cod"
        billing = @{
            first_name = "Khalid"
            last_name = "Al-Rashid"
            phone = "+966551234567"
            email = "khalid@example.com"
            address_1 = "123 King Fahd Road"
            address_2 = "Apartment 5B"
            city = "Riyadh"
            state = "Riyadh"
            postcode = "12345"
            country = "SA"
        }
        shipping = @{
            first_name = "Khalid"
            last_name = "Al-Rashid"
            address_1 = "123 King Fahd Road"
            address_2 = "Apartment 5B"
            city = "Riyadh"
            state = "Riyadh"
            postcode = "12345"
            country = "SA"
        }
        line_items = @(
            @{ name = "iPhone 15 Pro Case"; quantity = 1; total = "49.99"; sku = "CASE-001" }
            @{ name = "USB-C Cable 2m"; quantity = 2; total = "39.98"; sku = "CABLE-002" }
            @{ name = "Wireless Charger"; quantity = 1; total = "60.02"; sku = "CHRG-003" }
        )
    },
    @{
        id = 10002
        status = "processing"
        total = "299.00"
        currency = "SAR"
        customer_note = ""
        payment_method = "credit_card"
        billing = @{
            first_name = "Noura"
            last_name = "Al-Otaibi"
            phone = "+966559876543"
            email = "noura@example.com"
            address_1 = "456 Olaya Street"
            address_2 = ""
            city = "Riyadh"
            state = "Riyadh"
            postcode = "11564"
            country = "SA"
        }
        shipping = @{
            first_name = "Noura"
            last_name = "Al-Otaibi"
            address_1 = "456 Olaya Street"
            address_2 = ""
            city = "Riyadh"
            state = "Riyadh"
            postcode = "11564"
            country = "SA"
        }
        line_items = @(
            @{ name = "Samsung Galaxy Watch 6"; quantity = 1; total = "299.00"; sku = "WATCH-001" }
        )
    },
    @{
        id = 10003
        status = "processing"
        total = "85.50"
        currency = "SAR"
        customer_note = "Gift wrap please"
        payment_method = "paypal"
        billing = @{
            first_name = "Omar"
            last_name = "Hassan"
            phone = "+966501112233"
            email = "omar.hassan@example.com"
            address_1 = "789 Prince Sultan Street"
            address_2 = "Villa 12"
            city = "Jeddah"
            state = "Makkah"
            postcode = "21589"
            country = "SA"
        }
        shipping = @{
            first_name = "Omar"
            last_name = "Hassan"
            address_1 = "789 Prince Sultan Street"
            address_2 = "Villa 12"
            city = "Jeddah"
            state = "Makkah"
            postcode = "21589"
            country = "SA"
        }
        line_items = @(
            @{ name = "Bluetooth Speaker"; quantity = 1; total = "55.50"; sku = "SPKR-001" }
            @{ name = "AUX Cable"; quantity = 3; total = "30.00"; sku = "AUX-001" }
        )
    }
)

Write-Host ""
Write-Host "[SENDING WOOCOMMERCE WEBHOOKS]" -ForegroundColor Yellow

$orderNum = 1
foreach ($order in $orders) {
    Write-Host ""
    Write-Host "Order $orderNum - WooCommerce ID $($order.id)" -ForegroundColor Cyan
    
    $body = $order | ConvertTo-Json -Depth 5
    
    # Create HMAC signature (WooCommerce style)
    $secret = "webhook_secret_for_testing"
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
    $hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))
    $signature = [Convert]::ToBase64String($hash)
    
    $headers = @{
        "Content-Type" = "application/json"
        "X-WC-Webhook-Signature" = $signature
        "X-WC-Webhook-Source" = "https://my-wordpress-store.com"
        "X-WC-Webhook-Topic" = "order.created"
        "X-WC-Webhook-Resource" = "order"
        "X-WC-Webhook-Event" = "created"
        "X-API-Key" = $apiKey
    }
    
    try {
        $response = Invoke-RestMethod -Uri $webhookUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "[OK] Order received by Tookan" -ForegroundColor Green
        Write-Host "     Customer - $($order.billing.first_name) $($order.billing.last_name)" -ForegroundColor Gray
        Write-Host "     Phone - $($order.billing.phone)" -ForegroundColor Gray
        Write-Host "     Address - $($order.shipping.address_1), $($order.shipping.city)" -ForegroundColor Gray
        Write-Host "     Total - $($order.total) $($order.currency)" -ForegroundColor Gray
        Write-Host "     Items - $($order.line_items.Count) products" -ForegroundColor Gray
        
        if ($response.data.id) {
            Write-Host "     Tookan Order ID = $($response.data.id)" -ForegroundColor Green
        }
    } catch {
        Write-Host "[FAIL] Could not send order" -ForegroundColor Red
        Write-Host "       Error - $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get more details
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "       Response - $errorBody" -ForegroundColor Red
        }
    }
    
    $orderNum++
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "WOOCOMMERCE TEST COMPLETE!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check your dashboard:" -ForegroundColor Yellow
Write-Host "  - Tasks page for new orders" -ForegroundColor Gray
Write-Host "  - Dispatch page for map view" -ForegroundColor Gray
Write-Host ""
Write-Host "http://localhost:3000/dashboard/tasks" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
