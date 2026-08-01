$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Software\Microsoft\GameBar"
if (-not (Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
Set-ItemProperty -Path $path -Name "UseNexusForGameBarEnabled" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $path -Name "ShowStartupPanel" -Value 0 -Type DWord -Force
$appCap = "HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR"
if (-not (Test-Path $appCap)) { New-Item -Path $appCap -Force | Out-Null }
Set-ItemProperty -Path $appCap -Name "AppCaptureEnabled" -Value 0 -Type DWord -Force
Write-Output "Xbox Game Bar desativada."
