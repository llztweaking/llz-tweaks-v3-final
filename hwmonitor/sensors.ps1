$OutputEncoding=[System.Text.Encoding]::UTF8
[Console]::OutputEncoding=[System.Text.Encoding]::UTF8
$ErrorActionPreference='Stop'
$dir=$PSScriptRoot
try{Get-ChildItem "$dir\*.dll" -ErrorAction Stop | Unblock-File -ErrorAction SilentlyContinue}catch{}

# As dependências do LibreHardwareMonitorLib vêm de pacotes NuGet com versões de assembly que não
# batem exatamente com o que o .NET Framework 4.x resolveria por padrão (sem bindingRedirect, já
# que o host aqui é powershell.exe, não um app com .config próprio). Por isso resolvemos manualmente
# por nome simples, pegando o que estiver na pasta, independente da versão exigida.
$resolver=[System.ResolveEventHandler]{
 param($resolveSender,$resolveArgs)
 $simpleName=$resolveArgs.Name.Split(',')[0]
 $candidate=Join-Path $dir "$simpleName.dll"
 if(Test-Path $candidate){return [System.Reflection.Assembly]::LoadFrom($candidate)}
 return $null
}
[System.AppDomain]::CurrentDomain.add_AssemblyResolve($resolver)

$result=[ordered]@{cpuUsagePct=$null;gpuUsagePct=$null;cpuTempC=$null;gpuTempC=$null;diskHealth=$null}

try{
 Add-Type -Path (Join-Path $dir 'LibreHardwareMonitorLib.dll')
 $HW=[LibreHardwareMonitor.Hardware.HardwareType]
 $ST=[LibreHardwareMonitor.Hardware.SensorType]
 $computer=New-Object LibreHardwareMonitor.Hardware.Computer
 $computer.IsCpuEnabled=$true
 $computer.IsGpuEnabled=$true
 $computer.Open()
 try{
  $cpu=$computer.Hardware | Where-Object{$_.HardwareType -eq $HW::Cpu} | Select-Object -First 1
  if($cpu){
   $cpu.Update()
   $load=$cpu.Sensors | Where-Object{$_.SensorType -eq $ST::Load -and $_.Name -eq 'CPU Total'} | Select-Object -First 1
   if($load -and $null -ne $load.Value){$result.cpuUsagePct=[math]::Round([double]$load.Value)}
   $tempNames=@('CPU Package','Core (Tctl/Tdie)','Core Average','Core Max')
   $temp=$null
   foreach($n in $tempNames){
    $temp=$cpu.Sensors | Where-Object{$_.SensorType -eq $ST::Temperature -and $_.Name -eq $n -and $_.Value -gt 0} | Select-Object -First 1
    if($temp){break}
   }
   if(-not $temp){$temp=$cpu.Sensors | Where-Object{$_.SensorType -eq $ST::Temperature -and $_.Value -gt 0} | Select-Object -First 1}
   if($temp -and $null -ne $temp.Value){$result.cpuTempC=[math]::Round([double]$temp.Value,1)}
  }
  $gpu=$null
  foreach($t in @($HW::GpuNvidia,$HW::GpuAmd,$HW::GpuIntel)){
   $gpu=$computer.Hardware | Where-Object{$_.HardwareType -eq $t} | Select-Object -First 1
   if($gpu){break}
  }
  if($gpu){
   $gpu.Update()
   $gload=$gpu.Sensors | Where-Object{$_.SensorType -eq $ST::Load -and $_.Name -eq 'GPU Core'} | Select-Object -First 1
   if($gload -and $null -ne $gload.Value){$result.gpuUsagePct=[math]::Round([double]$gload.Value)}
   $gtemp=$gpu.Sensors | Where-Object{$_.SensorType -eq $ST::Temperature -and $_.Name -eq 'GPU Core'} | Select-Object -First 1
   if(-not $gtemp){$gtemp=$gpu.Sensors | Where-Object{$_.SensorType -eq $ST::Temperature -and $_.Value -gt 0} | Select-Object -First 1}
   if($gtemp -and $null -ne $gtemp.Value){$result.gpuTempC=[math]::Round([double]$gtemp.Value,1)}
  }
 }finally{
  $computer.Close()
 }
}catch{}

try{
 $d=Get-PhysicalDisk -ErrorAction Stop | Select-Object -First 1
 if($d){$result.diskHealth=[string]$d.HealthStatus}
}catch{}

[PSCustomObject]$result | ConvertTo-Json -Compress
