$env:Path = 'C:\Users\HOME\node20\node-v20.19.0-win-x64;' + $env:Path
Set-Location C:\Users\HOME\CodeBuddy\Claw\CaRepair
node verify-cards.mjs 2>&1 | Out-String -Width 300
