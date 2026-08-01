$ErrorActionPreference = "SilentlyContinue"
$out = & bcdedit.exe /set useplatformtick yes 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
  Write-Output "Platform Tick ativado. Reinicie o computador para aplicar."
} else {
  throw "Não foi possível ativar o Platform Tick: $($out.Trim())"
}
