$ErrorActionPreference = "SilentlyContinue"
$removed = $false

$gpuPrefPath = "HKCU:\Software\Microsoft\DirectX\UserGpuPreferences"
if (Test-Path $gpuPrefPath) {
  $props = Get-ItemProperty -Path $gpuPrefPath
  foreach ($prop in $props.PSObject.Properties) {
    if ($prop.Name -like "*FiveM*.exe") {
      Remove-ItemProperty -Path $gpuPrefPath -Name $prop.Name -Force
      $removed = $true
    }
  }
}

$compatPath = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers"
if (Test-Path $compatPath) {
  $props = Get-ItemProperty -Path $compatPath
  foreach ($prop in $props.PSObject.Properties) {
    if ($prop.Name -like "*FiveM*.exe") {
      Remove-ItemProperty -Path $compatPath -Name $prop.Name -Force
      $removed = $true
    }
  }
}

$priorityWarning = ""
$proc = Get-Process -Name "FiveM" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $proc) { $proc = Get-Process -Name "FiveM_GTAProcess" -ErrorAction SilentlyContinue | Select-Object -First 1 }
if ($proc) {
  try { $proc.PriorityClass = "Normal" } catch {}
  $proc.Refresh()
  if ($proc.PriorityClass -ne "Normal") { $priorityWarning = " A prioridade do processo em execução não pôde ser normalizada; feche e reabra o jogo para corrigir." }
}

if ($removed) {
  Write-Output "Otimizações do FiveM removidas: GPU dedicada e ajuste de tela cheia revertidos.$priorityWarning"
} else {
  Write-Output "Nenhuma otimização específica do FiveM encontrada para remover.$priorityWarning"
}
