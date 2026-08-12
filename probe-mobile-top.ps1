$env:Path = 'C:\Users\HOME\node20\node-v20.19.0-win-x64;' + $env:Path
# kill any running next servers to avoid stale build
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
  if ($_.CommandLine -and $_.CommandLine -like '*next*') {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 1
Set-Location C:\Users\HOME\CodeBuddy\Claw\CaRepair
Start-Process -FilePath "npx" -ArgumentList "next","start","-p","3100" -WindowStyle Hidden
Start-Sleep -Seconds 6
Write-Host "server-started"
