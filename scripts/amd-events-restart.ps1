$ErrorActionPreference = "SilentlyContinue"
$svc = Get-Service -DisplayName "*AMD External Events*" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($svc) {
  Restart-Service -Name $svc.Name -Force -ErrorAction SilentlyContinue
  Write-Output "Serviço de eventos AMD reiniciado."
} else {
  Write-Output "Serviço de eventos AMD não encontrado neste sistema."
}
