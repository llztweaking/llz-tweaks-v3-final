$ErrorActionPreference = "SilentlyContinue"
$targetName = "cs2.exe"
$removed = $false

$gpuPrefPath = "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences"
if (Test-Path $gpuPrefPath) {
  $props = Get-ItemProperty -Path $gpuPrefPath
  foreach ($prop in $props.PSObject.Properties) {
    if ($prop.Name -like "*$targetName") {
      Remove-ItemProperty -Path $gpuPrefPath -Name $prop.Name -Force
      $removed = $true
    }
  }
}

$compatPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
if (Test-Path $compatPath) {
  $props = Get-ItemProperty -Path $compatPath
  foreach ($prop in $props.PSObject.Properties) {
    if ($prop.Name -like "*$targetName") {
      Remove-ItemProperty -Path $compatPath -Name $prop.Name -Force
      $removed = $true
    }
  }
}

$priorityWarning = ""
$proc = Get-Process -Name "cs2" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) {
  try { $proc.PriorityClass = "Normal" } catch {}
  $proc.Refresh()
  if ($proc.PriorityClass -ne "Normal") { $priorityWarning = " A prioridade do processo em execução não pôde ser normalizada; feche e reabra o jogo para corrigir." }
}

if ($removed) {
  Write-Output "Otimizações do CS2 removidas: GPU dedicada e ajuste de tela cheia revertidos.$priorityWarning"
} else {
  Write-Output "Nenhuma otimização específica do CS2 encontrada para remover.$priorityWarning"
}
