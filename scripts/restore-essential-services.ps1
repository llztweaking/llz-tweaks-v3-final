$ErrorActionPreference = "SilentlyContinue"
$services = @('DiagTrack','wuauserv','BITS','Dhcp','Dnscache','EventLog','Schedule','Winmgmt','RpcSs','PlugPlay','Power','Audiosrv','LanmanWorkstation','LanmanServer','Netman','nsi')
$restored = @()
foreach ($svc in $services) {
  $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
  if ($s) {
    if ($s.StartType -eq 'Disabled') {
      Set-Service -Name $svc -StartupType Automatic -ErrorAction SilentlyContinue
    }
    if ($s.Status -ne 'Running') {
      Start-Service -Name $svc -ErrorAction SilentlyContinue
      $restored += $svc
    }
  }
}
if ($restored.Count -gt 0) {
  Write-Output ("Serviços essenciais restaurados: " + ($restored -join ', '))
} else {
  Write-Output "Todos os serviços essenciais já estavam ativos."
}
