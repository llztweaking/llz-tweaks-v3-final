$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Control Panel\Mouse"
Set-ItemProperty -Path $path -Name "MouseSpeed" -Value "0" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseThreshold1" -Value "0" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseThreshold2" -Value "0" -Type String -Force
Set-ItemProperty -Path $path -Name "MouseSensitivity" -Value "10" -Type String -Force
Write-Output "Aceleração do mouse desativada e sensibilidade ajustada para 6/11."
