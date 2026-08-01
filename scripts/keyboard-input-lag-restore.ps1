$ErrorActionPreference = "SilentlyContinue"
$kbdPath = "HKLM:\SYSTEM\CurrentControlSet\Services\kbdclass\Parameters"
if (Test-Path $kbdPath) {
  Remove-ItemProperty -Path $kbdPath -Name "KeyboardDataQueueSize" -Force -ErrorAction SilentlyContinue
}

Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\StickyKeys" -Name "Flags" -Value "510" -Type String -Force
Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\ToggleKeys" -Name "Flags" -Value "62" -Type String -Force
Set-ItemProperty -Path "HKCU:\Control Panel\Accessibility\Keyboard Response" -Name "Flags" -Value "62" -Type String -Force

Write-Output "Configurações padrão do teclado restauradas."
