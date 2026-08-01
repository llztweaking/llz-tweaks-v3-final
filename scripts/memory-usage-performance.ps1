$ErrorActionPreference = "SilentlyContinue"
$out = & fsutil.exe behavior set memoryusage 2 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
  Write-Output "Gerenciamento de memória ajustado para priorizar desempenho."
} else {
  throw "Não foi possível ajustar o gerenciamento de memória: $($out.Trim())"
}
