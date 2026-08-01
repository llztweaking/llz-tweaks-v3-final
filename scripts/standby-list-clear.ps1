$ErrorActionPreference = "SilentlyContinue"
try {
  $sig = @'
[DllImport("ntdll.dll")]
public static extern int NtSetSystemInformation(int SystemInformationClass, IntPtr SystemInformation, int SystemInformationLength);
'@
  Add-Type -MemberDefinition $sig -Name NtDll -Namespace Win32Native -ErrorAction Stop
  $MemoryPurgeStandbyList = 4
  $ptr = [System.Runtime.InteropServices.Marshal]::AllocHGlobal(4)
  [System.Runtime.InteropServices.Marshal]::WriteInt32($ptr, $MemoryPurgeStandbyList)
  $result = [Win32Native.NtDll]::NtSetSystemInformation(80, $ptr, 4)
  [System.Runtime.InteropServices.Marshal]::FreeHGlobal($ptr)
  if ($result -eq 0) {
    Write-Output "Standby List limpa. Memória em espera liberada."
  } else {
    Write-Output "Não foi possível limpar a Standby List (código $result)."
  }
} catch {
  Write-Output "Não foi possível limpar a Standby List: $($_.Exception.Message)"
}
