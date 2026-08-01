$ErrorActionPreference = "SilentlyContinue"
$out = & bcdedit.exe /set disabledynamictick yes 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
  Write-Output "Dynamic Tick desativado. Reinicie o computador para aplicar."
} else {
  throw "Não foi possível desativar o Dynamic Tick: $($out.Trim())"
}
