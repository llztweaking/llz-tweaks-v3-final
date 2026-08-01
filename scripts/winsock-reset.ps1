$ErrorActionPreference = "SilentlyContinue"
netsh winsock reset | Out-Null
Write-Output "Winsock resetado. Pode ser necessário reiniciar o computador."
