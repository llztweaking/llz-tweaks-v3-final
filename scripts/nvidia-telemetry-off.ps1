$ErrorActionPreference = "SilentlyContinue"
$svc = Get-Service -Name "NvTelemetryContainer" -ErrorAction SilentlyContinue
if ($svc) {
  Stop-Service -Name "NvTelemetryContainer" -Force -ErrorAction SilentlyContinue
  Set-Service -Name "NvTelemetryContainer" -StartupType Disabled -ErrorAction SilentlyContinue
  Write-Output "Telemetria NVIDIA desativada."
} else {
  Write-Output "Serviço de telemetria NVIDIA não encontrado neste sistema."
}
