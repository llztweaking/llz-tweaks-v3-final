const { execFile } = require('child_process')

const EMPTY_MOTHERBOARD_INFO = {
  boardManufacturer: null,
  boardModel: null,
  biosManufacturer: null,
  biosVersion: null,
  biosDate: null,
  chipset: null,
  ramTotalGb: null,
  ramSpeedMhz: null,
  windowsActivationStatus: null
}

const COMMAND = `$OutputEncoding=[System.Text.Encoding]::UTF8;[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;
$board=Get-CimInstance Win32_BaseBoard -ErrorAction SilentlyContinue | Select-Object -First 1;
$bios=Get-CimInstance Win32_BIOS -ErrorAction SilentlyContinue | Select-Object -First 1;
$mem=Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | Select-Object -First 1;
$biosDate=$null;try{if($bios.ReleaseDate){$biosDate=$bios.ReleaseDate.ToString('yyyy-MM-dd')}}catch{};
$chipset=$null;try{$chipsetMatch=Get-CimInstance Win32_PnPEntity -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'Chipset|PCH|LPC Controller' } | Select-Object -First 1;if($chipsetMatch){$chipset=[string]$chipsetMatch.Name}}catch{};
$activation=$null;try{$lic=Get-CimInstance SoftwareLicensingProduct -Filter "ApplicationID='55c92734-d682-4d71-983e-d6ec3f16059f' AND PartialProductKey IS NOT NULL" -ErrorAction Stop | Select-Object -First 1;if($lic){$activation=[int]$lic.LicenseStatus}}catch{};
[PSCustomObject]@{
  boardManufacturer=$board.Manufacturer
  boardModel=$board.Product
  biosManufacturer=$bios.Manufacturer
  biosVersion=$bios.SMBIOSBIOSVersion
  biosDate=$biosDate
  chipset=$chipset
  ramSpeedMhz=$mem.Speed
  windowsActivationStatus=$activation
} | ConvertTo-Json -Compress`

// PowerShell 5.1's ConvertTo-Json tem uma peculiaridade conhecida: um valor $null vindo de
// "Select-Object -ExpandProperty" numa pipeline vazia às vezes é serializado como objeto
// vazio "{}" em vez de "null". Isso quebraria a renderização no React (objeto não é um
// filho React válido), então qualquer campo que não seja string/number/boolean é
// forçado para null aqui, nunca repassado cru para a interface.
function sanitize(parsed) {
  const clean = {}
  for (const key of Object.keys(parsed)) {
    if (!(key in EMPTY_MOTHERBOARD_INFO)) continue
    const value = parsed[key]
    clean[key] = (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') ? value : null
  }
  return clean
}

function getMotherboardInfo() {
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', COMMAND],
      { windowsHide: true, timeout: 10000 },
      (err, stdout) => {
        const os = require('os')
        const ramTotalGb = Math.round((os.totalmem() / 1073741824) * 10) / 10
        if (err) return resolve({ ...EMPTY_MOTHERBOARD_INFO, ramTotalGb })
        try {
          const parsed = JSON.parse(stdout.trim())
          resolve({ ...EMPTY_MOTHERBOARD_INFO, ramTotalGb, ...sanitize(parsed) })
        } catch {
          resolve({ ...EMPTY_MOTHERBOARD_INFO, ramTotalGb })
        }
      }
    )
  })
}

module.exports = { getMotherboardInfo, EMPTY_MOTHERBOARD_INFO }
