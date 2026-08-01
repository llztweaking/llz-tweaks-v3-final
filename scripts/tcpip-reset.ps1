$ErrorActionPreference = "SilentlyContinue"
netsh int ip reset | Out-Null
Write-Output "Pilha TCP/IP resetada. Pode ser necessário reiniciar o computador."
