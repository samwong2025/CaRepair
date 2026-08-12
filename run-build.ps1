$env:CODEBUDDY_SAFE_DELETE_ENABLED = '0'
$env:Path = 'C:\Users\HOME\node20\node-v20.19.0-win-x64;' + $env:Path
Set-Location C:\Users\HOME\CodeBuddy\Claw\CaRepair
npx next build *> build-cards.log
Write-Host DONE
