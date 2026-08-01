$ErrorActionPreference = "SilentlyContinue"
$path = "HKCU:\Software\Microsoft\GameBar"
if (Test-Path $path) {
  Set-ItemProperty -Path $path -Name "AutoGameModeEnabled" -Value 0 -Type DWord -Force
}
Write-Output "Modo de Jogo do Windows desativado (padrão restaurado)."
