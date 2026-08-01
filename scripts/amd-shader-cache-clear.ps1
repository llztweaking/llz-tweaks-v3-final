$ErrorActionPreference = "SilentlyContinue"
$paths = @("$env:LOCALAPPDATA\AMD\DxCache", "$env:LOCALAPPDATA\AMD\DxcCache")
foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Path "$p\*" -Recurse -Force -ErrorAction SilentlyContinue
  }
}
Write-Output "Cache de shaders AMD limpo."
