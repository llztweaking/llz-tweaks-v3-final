$ErrorActionPreference = "SilentlyContinue"
$out = & cmd.exe /c "echo Y| chkdsk C: /f" 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
  if ($out -match "próxima vez|next time|agendad|scheduled") {
    Write-Output "Verificação de disco (CHKDSK) agendada para a próxima inicialização."
  } else {
    Write-Output "CHKDSK executado: nenhum problema pendente que exija reinicialização foi encontrado."
  }
} else {
  throw "Não foi possível agendar o CHKDSK: $($out.Trim())"
}
