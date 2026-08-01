$ErrorActionPreference = "SilentlyContinue"
ipconfig /flushdns | Out-Null
Write-Output "Cache DNS limpo."
