$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Control Panel\Mouse"
Set-ItemProperty -Path $path -Name "MouseSpeed" -Value "1" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseThreshold1" -Value "6" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseThreshold2" -Value "10" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseSensitivity" -Value "10" -Type String -Force
Write-Output "Configurações padrão do mouse restauradas."
