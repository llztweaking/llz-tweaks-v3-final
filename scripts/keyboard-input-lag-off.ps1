$ErrorActionPreference = "SilentlyContinue"
$kbdPath = "HKLM:\SYSTEM\CurrentControlSet\Services\kbdclass\Parameters"
if (-not (Test-Path $kbdPath)) { New-Item -Path $kbdPath -Force | Out-Null }
Set-ItemProperty -Path $kbdPath -Name "KeyboardDataQueueSize" -Value 20 -Type DWord -Force

Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\StickyKeys" -Name "Flags" -Value "0" -Type String -Force
Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\ToggleKeys" -Name "Flags" -Value "0" -Type String -Force
Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\Keyboard Response" -Name "Flags" -Value "0" -Type String -Force

Write-Output "Input lag do teclado reduzido (fila de dados aumentada e teclas de acessibilidade desativadas)."
