$ErrorActionPreference = "SilentlyContinue"
$toolDir = Join-Path $PSScriptRoot "nvidia-profile-inspector"
$exePath = Join-Path $toolDir "nvidiaProfileInspector.exe"
$profilePath = Join-Path $toolDir "llz-nvidia-profile.nip"

if (-not (Test-Path $exePath)) {
  throw "Ferramenta de perfil NVIDIA não encontrada na instalação."
}
if (-not (Test-Path $profilePath)) {
  throw "Perfil de otimização NVIDIA não encontrado na instalação."
}

$proc = Start-Process -FilePath $exePath -ArgumentList "-silentImport", "`"$profilePath`"" -Wait -PassThru -WindowStyle Hidden
if ($proc -and $proc.ExitCode -eq 0) {
  Write-Output "Perfil avançado NVIDIA aplicado com sucesso."
} else {
  Write-Output "Não foi possível confirmar a aplicação do perfil. Verifique se o driver NVIDIA está instalado."
}
