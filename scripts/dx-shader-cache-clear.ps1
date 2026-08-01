$ErrorActionPreference = "SilentlyContinue"
$path = "$env:LOCALAPPDATA\D3DSCache"
if (Test-Path $path) {
  Remove-Item -Path "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Output "Cache do DirectX Shader (DX Shader Cache) limpo."
