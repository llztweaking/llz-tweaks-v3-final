$ErrorActionPreference="SilentlyContinue"
powercfg /setactive SCHEME_BALANCED | Out-Null
Write-Output "Configuracoes restauradas."
