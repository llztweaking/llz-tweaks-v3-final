$ErrorActionPreference = "SilentlyContinue"
$out = & bcdedit.exe /set useplatformtick no 2>&1 | Out-String
Write-Output "Platform Tick restaurado ao padrão. Reinicie o computador para aplicar."
