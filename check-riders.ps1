# Check riders script
$apiKey = "tk_df8322331135bf32b7ba4212b0255abe115a6815c4e1ae61ebd9a7e7e3e3173b"

Write-Host "Checking riders for API Key: $apiKey" -ForegroundColor Cyan

try {
    # Get Company Info
    $company = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/company" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $apiKey" }
    
    Write-Host "`n=== COMPANY INFO ===" -ForegroundColor Green
    Write-Host "Name: $($company.data.name)"
    Write-Host "ID: $($company.data.id)"
    Write-Host "Company Code: $($company.data.company_code)"

    # Get Riders
    $riders = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/riders" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $apiKey" }

    Write-Host "`n=== RAW RIDERS RESPONSE ===" -ForegroundColor Cyan
    $riders | ConvertTo-Json -Depth 5 | Write-Host

    Write-Host "`n=== REGISTERED RIDERS ===" -ForegroundColor Green
    if ($riders.data.riders.Count -eq 0) {
        Write-Host "No riders found!" -ForegroundColor Red
    } else {
        foreach ($rider in $riders.data.riders) {
            Write-Host "Name: $($rider.name)" -ForegroundColor Yellow
            Write-Host "Phone: $($rider.phone)" -ForegroundColor White
            Write-Host "Status: $($rider.status)"
            Write-Host "-------------------"
        }
    }

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}
