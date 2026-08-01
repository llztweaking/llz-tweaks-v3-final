$ErrorActionPreference = "SilentlyContinue"

# Desativa o USB Selective Suspend (reduz latência de mouse/teclado USB)
powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0 | Out-Null
powercfg /setdcvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0 | Out-Null
powercfg /setactive SCHEME_CURRENT | Out-Null

# Desativa Fullscreen Optimizations (reduz input lag em jogos em tela cheia)
$fseKey = "HKCU:\System\GameConfigStore"
if (-not (Test-Path $fseKey)) { New-Item -Path $fseKey -Force | Out-Null }
Set-ItemProperty -Path $fseKey -Name "GameDVR_FSEBehaviorMode" -Value 2 -Type DWord -Force
Set-ItemProperty -Path $fseKey -Name "GameDVR_HonorUserFSEBehaviorMode" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $fseKey -Name "GameDVR_DXGIHonorFSEWindowsCompatible" -Value 1 -Type DWord -Force

# Ajusta o agendador de multimídia (MMCSS) para não limitar tarefas de baixa latência
$mmcssKey = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile"
Set-ItemProperty -Path $mmcssKey -Name "NetworkThrottlingIndex" -Value 0xffffffff -Type DWord -Force
Set-ItemProperty -Path $mmcssKey -Name "SystemResponsiveness" -Value 0 -Type DWord -Force

Write-Output "Recursos padrão do Windows que aumentam o input lag foram desativados."
