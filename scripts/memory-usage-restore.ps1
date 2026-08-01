$ErrorActionPreference = "SilentlyContinue"
$out = & fsutil.exe behavior set memoryusage 0 2>&1 | Out-String
Write-Output "Gerenciamento de memória restaurado ao padrão."
