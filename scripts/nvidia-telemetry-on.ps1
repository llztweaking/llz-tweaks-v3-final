$ErrorActionPreference = "SilentlyContinue"
$svc = Get-Service -Name "NvTelemetryContainer" -ErrorAction SilentlyContinue
if ($svc) {
  Set-Service -Name "NvTelemetryContainer" -StartupType Manual -ErrorAction SilentlyContinue
  Start-Service -Name "NvTelemetryContainer" -ErrorAction SilentlyContinue
  Write-Output "Telemetria NVIDIA restaurada."
} else {
  Write-Output "Serviço de telemetria NVIDIA não encontrado neste sistema."
}
