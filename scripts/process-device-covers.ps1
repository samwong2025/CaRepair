param(
  [string]$SrcDir = "c:\Users\HOME\CodeBuddy\Claw\CaRepair\public\device-covers\src",
  [string]$OutDir = "c:\Users\HOME\CodeBuddy\Claw\CaRepair\public\device-covers"
)
Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }

$map = [ordered]@{
  iPhone   = "Single_Apple_iPhone_17_Pro_Max_2026-08-10T14-46-14.png"
  iPad     = "Single_Apple_iPad_Pro_13_inch__2026-08-10T14-46-15.png"
  Watch    = "Single_Apple_Watch_Series_10_4_2026-08-10T14-46-16.png"
  MacBook  = "Single_Apple_MacBook_Pro_14_in_2026-08-10T14-46-19.png"
}

foreach ($kv in $map.GetEnumerator()) {
  $label = $kv.Key
  $file  = $kv.Value
  $inPath = Join-Path $SrcDir $file
  $outPath = Join-Path $OutDir ("device-" + $label.ToLower() + ".png")

  $src = [System.Drawing.Image]::FromFile($inPath)
  $w = $src.Width; $h = $src.Height
  Write-Host "[$label] src=${w}x${h}"

  # 建一张 32bpp ARGB
  $bmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  $src.Dispose()

  $thresh = 245
  # 锁定像素
  $rect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
  $data  = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $bmp.PixelFormat)
  try {
    $stride = $data.Stride
    $bytes  = New-Object byte[] ($stride * $h)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

    for ($y = 0; $y -lt $h; $y++) {
      $rowStart = $y * $stride
      for ($x = 0; $x -lt $w; $x++) {
        $i = $rowStart + $x * 4
        # BGRA
        $b = $bytes[$i]
        $gr = $bytes[$i + 1]
        $r = $bytes[$i + 2]
        if ($r -ge $thresh -and $gr -ge $thresh -and $b -ge $thresh) {
          $minDelta = [Math]::Min(255 - $r, [Math]::Min(255 - $gr, 255 - $b))
          if ($minDelta -le 6) { $bytes[$i + 3] = 0 }
          else { $bytes[$i + 3] = [int][Math]::Round(($minDelta / 10.0) * 255) }
        }
      }
    }
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  } finally {
    $bmp.UnlockBits($data)
  }

  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Host "[$label] saved $outPath"
}

Write-Host "DONE"
