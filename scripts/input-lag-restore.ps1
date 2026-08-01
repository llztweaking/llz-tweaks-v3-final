$ErrorActionPreference = "SilentlyContinue"

powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 1 | Out-Null
powercfg /setdcvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 1 | Out-Null
powercfg /setactive SCHEME_CURRENT | Out-Null

$fseKey = "HKCU:\System\GameConfigStore"
if (Test-Path $fseKey) {
  Set-ItemProperty -Path $fseKey -Name "GameDVR_FSEBehaviorMode" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $fseKey -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 0 -Type DWord -Force
  Set-ItemProperty -Path $fseKey -Name "GameDVR_DXGIHonorFSEWindowsCompatible" -Value 0 -Type DWord -Force
}

$mmcssKey = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile"
Set-ItemProperty -Path $mmcssKey -Name "NetworkThrottlingIndex" -Value 10 -Type DWord -Force
Set-ItemProperty -Path $mmcssKey -Name "SystemResponsiveness" -Value 20 -Type DWord -Force

Write-Output "Configurações padrão do Windows restauradas."
