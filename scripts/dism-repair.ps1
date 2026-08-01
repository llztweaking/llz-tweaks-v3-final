$ErrorActionPreference = "SilentlyContinue"
$out = & DISM.exe /Online /Cleanup-Image /RestoreHealth 2>&1 | Out-String
Write-Output $out.Trim()
