$ErrorActionPreference = "SilentlyContinue"
ipconfig /release | Out-Null
ipconfig /renew | Out-Null
Write-Output "Endereço IP renovado."
