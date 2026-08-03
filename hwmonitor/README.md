# hwmonitor/

Contém a `LibreHardwareMonitorLib.dll` (e suas dependências) usada por `sensors.ps1` para ler
sensores reais de CPU/GPU (uso e temperatura), em vez de depender do PerfLib do Windows ou da
zona ACPI genérica — ambos pouco confiáveis (ver comentários em `electron/main.cjs`, função
`getBenchmarksViaSensorsLib`).

- Projeto: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor
- Licença: MPL-2.0 (https://licenses.nuget.org/MPL-2.0) — código-fonte original disponível no
  repositório acima; os binários aqui não foram modificados.
- Pacotes NuGet usados (versões): LibreHardwareMonitorLib 0.9.6, DiskInfoToolkit 1.1.2,
  RAMSPDToolkit-NDD 1.4.2, HidSharp 2.6.4, System.Memory 4.6.3, System.Threading.AccessControl
  10.0.3, System.Runtime.CompilerServices.Unsafe 6.0.0, System.Numerics.Vectors 4.5.0.

`sensors.ps1` carrega a DLL via `Add-Type` e resolve as dependências manualmente por nome (ver
comentário no próprio script) porque o host (`powershell.exe`) não tem um `.config` com
bindingRedirect para as versões exatas que o NuGet resolveu.

Ao chamar `Computer.Open()`, a biblioteca pode instalar/iniciar um driver de acesso a hardware em
baixo nível (necessário pra ler temperatura de CPU via MSR) — o mesmo mecanismo usado por
ferramentas como HWiNFO. Isso só funciona com o app rodando elevado, que já é o caso aqui
(`requireAdministrator`).
