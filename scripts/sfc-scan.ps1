$ErrorActionPreference = "SilentlyContinue"
$out = & sfc.exe /scannow 2>&1 | Out-String
Write-Output $out.Trim()
