$ErrorActionPreference = "SilentlyContinue"
$paths = @("$env:LOCALAPPDATA\NVIDIA\GLCache", "$env:LOCALAPPDATA\NVIDIA\DXCache")
foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Path "$p\*" -Recurse -Force -ErrorAction SilentlyContinue
  }
}
Write-Output "Cache de shaders NVIDIA limpo."
