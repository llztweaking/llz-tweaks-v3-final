$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Software\Microsoft\GameBar"
if (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "AllowAutoGameMode" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $path -Name "AutoGameModeEnabled" -Value 1 -Type DWord -Force
Write-Output "Modo de Jogo do Windows ativado."
