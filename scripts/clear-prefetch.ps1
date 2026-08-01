$ErrorActionPreference = "SilentlyContinue"
Remove-Item -Path "$env:SystemRoot\Prefetch\*.*" -Force -ErrorAction SilentlyContinue -ErrorVariable removeErrors
$remaining = @(Get-ChildItem -Path "$env:SystemRoot\Prefetch\*.*" -Force -ErrorAction SilentlyContinue)
if ($remaining.Count -eq 0) {
  Write-Output "Cache do Prefetch limpo."
} elseif ($removeErrors.Count -gt 0) {
  Write-Output "Cache do Prefetch parcialmente limpo ($($remaining.Count) arquivo(s) em uso não puderam ser removidos)."
} else {
  Write-Output "Cache do Prefetch limpo."
}
