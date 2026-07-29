$ErrorActionPreference="Stop"
powercfg /setactive SCHEME_MIN | Out-Null
Write-Output "Perfil competitivo aplicado."
