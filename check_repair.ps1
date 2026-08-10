$resp = Invoke-WebRequest -Uri http://localhost:3000/repair -UseBasicParsing
Write-Host "HTTP $($resp.StatusCode)"
$c = $resp.Content
'揀機型','揀故障','睇報價','約時間' | ForEach-Object {
  Write-Host "has [$_]: $($c -match [regex]::Escape($_))"
}
