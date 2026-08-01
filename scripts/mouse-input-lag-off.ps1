$ErrorActionPreference = "SilentlyContinue"
$mousePath = "HKLM:\SYSTEM\CurrentControlSet\Services\mouclass\Parameters"
if (-not (Test-Path $mousePath)) { New-Item -Path $mousePath -Force | Out-Null }
Set-ItemProperty -Path $mousePath -Name "MouseDataQueueSize" -Value 20 -Type DWord -Force

Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\MouseKeys" -Name "Flags" -Value "0" -Type String -Force

Write-Output "Input lag do mouse reduzido (fila de dados aumentada e MouseKeys desativado)."
