$ErrorActionPreference = "SilentlyContinue"
Stop-Process -Name explorer -Force
Start-Sleep -Milliseconds 800
Start-Process explorer.exe
Write-Output "Explorer reiniciado."
