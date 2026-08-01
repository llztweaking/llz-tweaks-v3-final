$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Software\Microsoft\GameBar"
if (Test-Path $path) {
  Set-ItemProperty -Path $path -Name "UseNexusForGameBarEnabled" -Value 1 -Type DWord -Force
  Set-ItemProperty -Path $path -Name "ShowStartupPanel" -Value 1 -Type DWord -Force
}
$appCap = "HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR"
if (Test-Path $appCap) {
  Set-ItemProperty -Path $appCap -Name "AppCaptureEnabled" -Value 1 -Type DWord -Force
}
Write-Output "Xbox Game Bar restaurada."
