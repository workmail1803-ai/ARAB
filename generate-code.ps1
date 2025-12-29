# Generate company code script
$apiKey = "tk_df8322331135bf32b7ba4212b0255abe115a6815c4e1ae61ebd9a7e7e3e3173b"

Write-Host "Generating company code..." -ForegroundColor Cyan

try {
    # Generate new company code
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/company" `
        -Method PATCH `
        -Headers @{ 
            "x-api-key" = $apiKey
            "Content-Type" = "application/json" 
        } `
        -Body '{"regenerate_company_code": true}'
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  COMPANY CODE GENERATED SUCCESSFULLY  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Company: $($response.data.name)" -ForegroundColor White
    Write-Host ""
    Write-Host "  CODE: $($response.data.company_code)" -ForegroundColor Black -BackgroundColor Yellow
    Write-Host ""
    Write-Host "Share this code with your riders!" -ForegroundColor Cyan
    Write-Host "They will use it in the Agent App to login." -ForegroundColor Gray
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

