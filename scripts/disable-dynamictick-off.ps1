$ErrorActionPreference = "SilentlyContinue"
$out = & bcdedit.exe /set disabledynamictick no 2>&1 | Out-String
Write-Output "Dynamic Tick restaurado ao padrão. Reinicie o computador para aplicar."
