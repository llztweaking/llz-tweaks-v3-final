$ErrorActionPreference = "SilentlyContinue"
$mousePath = "HKLM:\SYSTEM\CurrentControlSet\Services\mouclass\Parameters"
if (Test-Path $mousePath) {
  Remove-ItemProperty -Path $mousePath -Name "MouseDataQueueSize" -Force -ErrorAction SilentlyContinue
}

Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\MouseKeys" -Name "Flags" -Value "59" -Type String -Force

Write-Output "Configurações padrão do mouse restauradas."
