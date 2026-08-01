$ErrorActionPreference = "SilentlyContinue"
$ultimateGuid = "e9a42b02-d5df-448d-aa00-03f14749eb61"
$existing = powercfg /list | Select-String $ultimateGuid
if (-not $existing) {
  $dup = powercfg /duplicatescheme $ultimateGuid
  $newGuid = ($dup -split " ")[3]
  if ($newGuid) { powercfg /setactive $newGuid }
} else {
  powercfg /setactive $ultimateGuid
}
Write-Output "Plano de energia Ultimate Performance ativado."
