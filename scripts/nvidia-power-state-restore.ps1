$ErrorActionPreference = "SilentlyContinue"
$controllers = Get-CimInstance Win32_VideoController | Where-Object { $_.PNPDeviceID -like "PCI\VEN_*" }
foreach ($gpu in $controllers) {
  $enumPath = "HKLM:\SYSTEM\ControlSet001\Enum\$($gpu.PNPDeviceID)"
  $driverValue = (Get-ItemProperty -Path $enumPath -Name "Driver" -ErrorAction SilentlyContinue).Driver
  if ($driverValue -match "\{") {
    $classPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Class\$driverValue"
    if (Test-Path $classPath) {
      Set-ItemProperty -Path $classPath -Name "DisableDynamicPstate" -Value 0 -Type DWord -Force
    }
  }
}
$ftsPath = "HKLM:\SYSTEM\CurrentControlSet\Services\nvlddmkm\FTS"
if (Test-Path $ftsPath) {
  Set-ItemProperty -Path $ftsPath -Name "EnableGR535" -Value 1 -Type DWord -Force
}
Write-Output "Estado de energia da GPU NVIDIA restaurado ao padrão."
