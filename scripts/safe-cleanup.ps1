$ErrorActionPreference="SilentlyContinue"
Get-ChildItem $env:TEMP -Force | Remove-Item -Recurse -Force
Write-Output "Limpeza segura concluida."
