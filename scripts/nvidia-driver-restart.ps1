$ErrorActionPreference = "SilentlyContinue"
$svc = Get-Service -Name "NVDisplay.ContainerLocalSystem" -ErrorAction SilentlyContinue
if ($svc) {
  Restart-Service -Name "NVDisplay.ContainerLocalSystem" -Force -ErrorAction SilentlyContinue
  Write-Output "Serviço do driver NVIDIA reiniciado."
} else {
  Write-Output "Serviço do driver NVIDIA não encontrado neste sistema."
}
