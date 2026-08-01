$ErrorActionPreference = "SilentlyContinue"
$proc = Get-Process -Name "FortniteClient-Win64-Shipping" -ErrorAction SilentlyContinue | Select-Object -First 1

$gameDvrPath = "HKCU:\System\GameConfigStore"
if (-not (Test-Path $gameDvrPath)) { New-Item -Path $gameDvrPath -Force | Out-Null }
Set-ItemProperty -Path $gameDvrPath -Name "GameDVR_Enabled" -Value 0 -Type DWord -Force

$dvrCapturePath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR"
if (-not (Test-Path $dvrCapturePath)) { New-Item -Path $dvrCapturePath -Force | Out-Null }
Set-ItemProperty -Path $dvrCapturePath -Name "AppCaptureEnabled" -Value 0 -Type DWord -Force

if ($proc -and $proc.Path) {
  $exePath = $proc.Path
  try { $proc.PriorityClass = "High" } catch {}
  $proc.Refresh()
  $priorityOk = ($proc.PriorityClass -eq "High")

  $gpuPrefPath = "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences"
  if (-not (Test-Path $gpuPrefPath)) { New-Item -Path $gpuPrefPath -Force | Out-Null }
  Set-ItemProperty -Path $gpuPrefPath -Name $exePath -Value "GpuPreference=2;" -Type String -Force

  $compatPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
  if (-not (Test-Path $compatPath)) { New-Item -Path $compatPath -Force | Out-Null }
  Set-ItemProperty -Path $compatPath -Name $exePath -Value "~ DISABLEDXMAXIMIZEDWINDOWEDMODE" -Type String -Force

  if ($priorityOk) {
    Write-Output "Fortnite detectado: prioridade alta, GPU dedicada e otimizações de tela cheia aplicadas."
  } else {
    Write-Output "Fortnite detectado: GPU dedicada e otimizações de tela cheia aplicadas. Não foi possível elevar a prioridade do processo (permissão negada pelo sistema)."
  }
} else {
  Write-Output "Fortnite não está em execução. Ajustes gerais aplicados; abra o jogo e otimize novamente para GPU dedicada e prioridade de processo."
}
