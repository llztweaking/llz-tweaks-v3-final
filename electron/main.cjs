const {app,BrowserWindow,ipcMain,Tray,Menu,shell}=require('electron')
const {autoUpdater}=require('electron-updater')
const path=require('path'),os=require('os'),fs=require('fs'),http=require('http')
const {execFile}=require('child_process')
const {getMotherboardInfo}=require('./services/motherboard.cjs')
app.setName('LLZ Tweaks')
if(process.platform==='win32')app.setAppUserModelId('com.llztweaks.app')
let win
let tray=null
let isQuitting=false
let currentSession=null
function isSessionValid(){
 return !!currentSession && currentSession.status==='ACTIVE'
}
function getSettingsPath(){return path.join(app.getPath('userData'),'settings.json')}
function readSettings(){
 try{return JSON.parse(fs.readFileSync(getSettingsPath(),'utf8'))}catch{return {}}
}
function writeSettings(next){
 try{fs.writeFileSync(getSettingsPath(),JSON.stringify(next))}catch{}
}
const appSettings={runInBackground:false,...readSettings()}
// Fluxo de OAuth do Discord: em vez de protocolo customizado (exigiria mexer no instalador
// NSIS), sobe um servidor local temporário só durante o cadastro/login. O Supabase devolve
// os tokens no fragmento da URL (#access_token=...), que o navegador nunca envia ao servidor —
// por isso a página de callback usa um script inline que relê o fragmento e reenvia como
// query string pra rota /token, onde o Node finalmente consegue capturá-lo.
const DISCORD_OAUTH_PORT=51739
let pendingDiscordAuth=null
function createDiscordOAuthServer(){
 return new Promise((resolveSetup,rejectSetup)=>{
  let resolveTokens
  const tokenPromise=new Promise((resolve)=>{resolveTokens=resolve})
  const server=http.createServer((req,res)=>{
   let reqUrl
   try{reqUrl=new URL(req.url,'http://127.0.0.1')}catch{res.writeHead(400);res.end();return}
   if(reqUrl.pathname==='/callback'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'})
    res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>LLZ Tweaks</title></head><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#eee;font-family:sans-serif"><p id="m">Conectando...</p><script>fetch("/token"+location.hash.replace("#","?")).then(function(r){return r.text()}).then(function(t){document.getElementById("m").textContent=t}).catch(function(){document.getElementById("m").textContent="Falha ao conectar. Volte ao LLZ Tweaks e tente novamente."})</script></body></html>')
   }else if(reqUrl.pathname==='/token'){
    const params=Object.fromEntries(reqUrl.searchParams)
    res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'})
    res.end(params.access_token?'Conectado! Pode fechar esta aba e voltar para o LLZ Tweaks.':'Não foi possível conectar. Feche esta aba e tente novamente no LLZ Tweaks.')
    resolveTokens(params)
    setTimeout(()=>server.close(),300)
   }else{
    res.writeHead(404)
    res.end()
   }
  })
  server.on('error',rejectSetup)
  server.listen(DISCORD_OAUTH_PORT,'127.0.0.1',()=>resolveSetup({tokenPromise,server}))
 })
}
function createTray(){
 if(tray)return
 tray=new Tray(path.join(__dirname,'../build/icon.ico'))
 tray.setToolTip('LLZ Tweaks')
 tray.setContextMenu(Menu.buildFromTemplate([
  {label:'Abrir LLZ Tweaks',click:()=>{win?.show();win?.focus()}},
  {type:'separator'},
  {label:'Sair',click:()=>{isQuitting=true;app.quit()}}
 ]))
 tray.on('click',()=>{win?.show();win?.focus()})
}
function setupAutoUpdater(){
 autoUpdater.autoDownload=true
 autoUpdater.on('update-available',(info)=>win?.webContents.send('updates:status',{status:'available',version:info.version}))
 autoUpdater.on('update-not-available',()=>win?.webContents.send('updates:status',{status:'up-to-date'}))
 autoUpdater.on('download-progress',(p)=>win?.webContents.send('updates:status',{status:'downloading',percent:Math.round(p.percent)}))
 autoUpdater.on('update-downloaded',(info)=>win?.webContents.send('updates:status',{status:'ready',version:info.version}))
 autoUpdater.on('error',(err)=>win?.webContents.send('updates:status',{status:'error',message:err.message}))
}
function s(file,elevated=false,timeout=20000){return {file,elevated,timeout}}
const scripts={
 'restore-defaults':s('restore-defaults.ps1'),
 'safe-cleanup':s('safe-cleanup.ps1'),
 'competitive-profile':s('competitive-profile.ps1'),
 'game-cs2':s('game-cs2.ps1',true),
 'game-valorant':s('game-valorant.ps1',true),
 'game-fortnite':s('game-fortnite.ps1',true),
 'game-fivem':s('game-fivem.ps1',true),
 'ultimate-performance':s('ultimate-performance.ps1',true),
 'game-mode-on':s('game-mode-on.ps1'),
 'gamebar-off':s('gamebar-off.ps1'),
 'explorer-restart':s('explorer-restart.ps1'),
 'visual-performance':s('visual-performance.ps1'),
 'mouse-accel-off':s('mouse-accel-off.ps1'),
 'mouse-restore-default':s('mouse-restore-default.ps1'),
 'keyboard-accessibility-off':s('keyboard-accessibility-off.ps1'),
 'keyboard-accessibility-restore':s('keyboard-accessibility-restore.ps1'),
 'dns-flush':s('dns-flush.ps1'),
 'ip-renew':s('ip-renew.ps1',true),
 'winsock-reset':s('winsock-reset.ps1',true),
 'tcpip-reset':s('tcpip-reset.ps1',true),
 'empty-recycle-bin':s('empty-recycle-bin.ps1'),
 'clear-prefetch':s('clear-prefetch.ps1',true),
 'open-disk-cleanup':s('open-disk-cleanup.ps1'),
 'dx-shader-cache-clear':s('dx-shader-cache-clear.ps1'),
 'windows-update-cache-clear':s('windows-update-cache-clear.ps1',true),
 'thumbcache-clear':s('thumbcache-clear.ps1'),
 'sfc-scan':s('sfc-scan.ps1',true,900000),
 'dism-repair':s('dism-repair.ps1',true,1200000),
 'chkdsk-schedule':s('chkdsk-schedule.ps1',true),
 'memory-usage-performance':s('memory-usage-performance.ps1',true),
 'platform-tick-on':s('platform-tick-on.ps1',true),
 'disable-dynamictick-on':s('disable-dynamictick-on.ps1',true),
 'input-lag-off':s('input-lag-off.ps1',true),
 'standby-list-clear':s('standby-list-clear.ps1',true),
 'restore-essential-services':s('restore-essential-services.ps1',true),
 'nvidia-telemetry-off':s('nvidia-telemetry-off.ps1',true),
 'nvidia-driver-restart':s('nvidia-driver-restart.ps1',true),
 'nvidia-shader-cache-clear':s('nvidia-shader-cache-clear.ps1'),
 'amd-events-restart':s('amd-events-restart.ps1',true),
 'amd-shader-cache-clear':s('amd-shader-cache-clear.ps1'),
 'nvidia-power-state-lock':s('nvidia-power-state-lock.ps1',true),
 'nvidia-apply-profile':s('nvidia-apply-profile.ps1',true,30000),
 'keyboard-input-lag-off':s('keyboard-input-lag-off.ps1',true),
 'mouse-input-lag-off':s('mouse-input-lag-off.ps1',true)
}
const revertScripts={
 'competitive-profile':s('restore-defaults.ps1'),
 'ultimate-performance':s('restore-defaults.ps1'),
 'game-cs2':s('game-cs2-revert.ps1',true),
 'game-valorant':s('game-valorant-revert.ps1',true),
 'game-fortnite':s('game-fortnite-revert.ps1',true),
 'game-fivem':s('game-fivem-revert.ps1',true),
 'game-mode-on':s('game-mode-off.ps1'),
 'gamebar-off':s('gamebar-on.ps1'),
 'visual-performance':s('visual-restore.ps1'),
 'mouse-accel-off':s('mouse-restore-default.ps1'),
 'keyboard-accessibility-off':s('keyboard-accessibility-restore.ps1'),
 'memory-usage-performance':s('memory-usage-restore.ps1',true),
 'platform-tick-on':s('platform-tick-off.ps1',true),
 'disable-dynamictick-on':s('disable-dynamictick-off.ps1',true),
 'input-lag-off':s('input-lag-restore.ps1',true),
 'nvidia-telemetry-off':s('nvidia-telemetry-on.ps1',true),
 'nvidia-power-state-lock':s('nvidia-power-state-restore.ps1',true),
 'keyboard-input-lag-off':s('keyboard-input-lag-restore.ps1',true),
 'mouse-input-lag-off':s('mouse-input-lag-restore.ps1',true)
}
function getScriptsDir(){
 return app.isPackaged?path.join(process.resourcesPath,'app.asar.unpacked','scripts'):path.join(__dirname,'../scripts')
}
function getDriversDir(){
 return app.isPackaged?path.join(process.resourcesPath,'app.asar.unpacked','drivers'):path.join(__dirname,'../drivers')
}
// Cada entrada aponta pra um instalador oficial colocado em drivers/<file>.
// O botão só aparece no painel se o arquivo realmente existir (ver drivers:list).
// silent:true + args = instalador roda sem UI e o resultado reflete o exit code real.
// silent:false (padrão) = só abre o instalador (wizard com UI) e não espera terminar.
const driverEntries=[]
function runDriverInstaller(entry){
 const filePath=path.join(getDriversDir(),entry.file)
 if(!fs.existsSync(filePath))return Promise.reject(new Error('Arquivo do driver não encontrado nesta instalação.'))
 const literalPath=filePath.replace(/'/g,"''")
 if(entry.silent){
  const argList=(entry.args||[]).map((a)=>`'${a.replace(/'/g,"''")}'`).join(',')
  const command=argList
   ?`$p=Start-Process -FilePath '${literalPath}' -ArgumentList ${argList} -Verb RunAs -Wait -PassThru -WindowStyle Hidden;exit $p.ExitCode`
   :`$p=Start-Process -FilePath '${literalPath}' -Verb RunAs -Wait -PassThru -WindowStyle Hidden;exit $p.ExitCode`
  return new Promise((resolve,reject)=>{
   execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,timeout:entry.timeout||120000},(err)=>{
    if(err)return reject(new Error('A instalação falhou ou a permissão de administrador foi negada.'))
    resolve('Instalado com sucesso.')
   })
  })
 }
 const command=`Start-Process -FilePath '${literalPath}' -Verb RunAs`
 return new Promise((resolve,reject)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,timeout:15000},(err)=>{
   if(err)return reject(new Error('Não foi possível abrir o instalador (permissão de administrador negada ou cancelada).'))
   resolve('Instalador aberto. Siga as instruções na tela para concluir.')
  })
 })
}
function runScriptFile(file,timeoutMs=20000){
 if(!file)return Promise.reject(new Error('Script desconhecido.'))
 const scriptPath=path.join(getScriptsDir(),file)
 const literalPath=scriptPath.replace(/'/g,"''")
 const command=`$OutputEncoding=[System.Text.Encoding]::UTF8;[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$code=[System.IO.File]::ReadAllText('${literalPath}',[System.Text.Encoding]::UTF8);Invoke-Expression $code`
 return new Promise((resolve,reject)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',command],{windowsHide:true,timeout:timeoutMs},(err,stdout,stderr)=>{
   if(err)return reject(new Error(stderr?.trim()||err.message))
   resolve(stdout.trim())
  })
 })
}
function runScriptFileElevated(file,timeoutMs=60000){
 if(!file)return Promise.reject(new Error('Script desconhecido.'))
 const scriptPath=path.join(getScriptsDir(),file)
 const literalPath=scriptPath.replace(/'/g,"''")
 const outFile=path.join(os.tmpdir(),`llz-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`)
 const literalOut=outFile.replace(/'/g,"''")
 const inner=`$OutputEncoding=[System.Text.Encoding]::UTF8;[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$noBom=New-Object System.Text.UTF8Encoding($false);try{$code=[System.IO.File]::ReadAllText('${literalPath}',[System.Text.Encoding]::UTF8);$result=Invoke-Expression $code;[System.IO.File]::WriteAllText('${literalOut}','OK|'+($result -join "\`n"),$noBom)}catch{[System.IO.File]::WriteAllText('${literalOut}','ERR|'+$_.Exception.Message,$noBom)}`
 const encoded=Buffer.from(inner,'utf16le').toString('base64')
 const outer=`Start-Process powershell.exe -Verb RunAs -WindowStyle Hidden -Wait -ArgumentList '-NoProfile','-NonInteractive','-EncodedCommand','${encoded}'`
 return new Promise((resolve,reject)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-Command',outer],{windowsHide:true,timeout:timeoutMs},(err)=>{
   if(err){fs.unlink(outFile,()=>{});return reject(new Error('Permissão de administrador negada ou cancelada.'))}
   fs.readFile(outFile,'utf8',(readErr,data)=>{
    fs.unlink(outFile,()=>{})
    if(readErr)return reject(new Error('Não foi possível confirmar o resultado (verifique se aceitou a permissão de administrador).'))
    if(data.charCodeAt(0)===0xFEFF)data=data.slice(1)
    const sep=data.indexOf('|')
    const status=data.slice(0,sep)
    const message=data.slice(sep+1)
    if(status==='OK')return resolve(message.trim())
    reject(new Error(message.trim()||'Falha ao executar com permissão de administrador.'))
   })
  })
 })
}
function runScript(id){
 const entry=scripts[id]
 if(!entry)return Promise.reject(new Error('Script desconhecido.'))
 return entry.elevated?runScriptFileElevated(entry.file,entry.timeout):runScriptFile(entry.file,entry.timeout)
}
function revertScript(id){
 const entry=revertScripts[id]
 if(!entry)return Promise.reject(new Error('Esta otimização não pode ser revertida.'))
 return entry.elevated?runScriptFileElevated(entry.file,entry.timeout):runScriptFile(entry.file,entry.timeout)
}
const emptyHardwareInfo={gpu:null,diskModel:null,diskSizeGb:null,diskType:null,diskFreeGb:null,diskTotalGb:null,osName:null,osBuild:null,installDate:null}
function getHardwareInfo(){
 const command=`$OutputEncoding=[System.Text.Encoding]::UTF8;[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$os=Get-CimInstance Win32_OperatingSystem;$gpu=(Get-CimInstance Win32_VideoController | Select-Object -First 1 -ExpandProperty Name);$disk=Get-CimInstance Win32_DiskDrive | Select-Object -First 1 Model,Size;$logicalDisk=Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'";$media=$null;try{$media=(Get-PhysicalDisk | Select-Object -First 1 -ExpandProperty MediaType)}catch{};[PSCustomObject]@{gpu=$gpu;diskModel=$disk.Model;diskSizeGb=[math]::Round($disk.Size/1GB);diskType=$media;diskFreeGb=[math]::Round($logicalDisk.FreeSpace/1GB);diskTotalGb=[math]::Round($logicalDisk.Size/1GB);osName=$os.Caption;osBuild=$os.BuildNumber;installDate=$os.InstallDate.ToString('o')} | ConvertTo-Json -Compress`
 return new Promise((resolve)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',command],{windowsHide:true,timeout:8000},(err,stdout)=>{
   if(err)return resolve({...emptyHardwareInfo})
   try{resolve({...emptyHardwareInfo,...JSON.parse(stdout.trim())})}catch{resolve({...emptyHardwareInfo})}
  })
 })
}
function getHwid(){
 return new Promise((resolve)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command','(Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Cryptography" -Name MachineGuid).MachineGuid'],{windowsHide:true,timeout:5000},(err,stdout)=>{
   if(err)return resolve(null)
   resolve(stdout.trim()||null)
  })
 })
}
const emptyBenchmarks={cpuUsagePct:null,gpuUsagePct:null,cpuTempC:null,gpuTempC:null,diskHealth:null}
function getBenchmarks(){
 const command=`$OutputEncoding=[System.Text.Encoding]::UTF8;[Console]::OutputEncoding=[System.Text.Encoding]::UTF8;$cpuUsage=$null;try{$cpuUsage=[math]::Round((Get-Counter '\\Processor(_Total)\\% Processor Time' -ErrorAction Stop).CounterSamples[0].CookedValue)}catch{};$gpuUsage=$null;try{$samples=(Get-Counter '\\GPU Engine(*engtype_3D)\\Utilization Percentage' -ErrorAction Stop).CounterSamples;$sum=($samples|Measure-Object -Property CookedValue -Sum).Sum;if($null -ne $sum){$gpuUsage=[math]::Round([math]::Min([double]$sum,100))}}catch{};$cpuTemp=$null;try{$t=Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop | Select-Object -First 1;if($t){$cpuTemp=[math]::Round((($t.CurrentTemperature)/10)-273.15,1)}}catch{};$diskHealth=$null;try{$d=Get-PhysicalDisk -ErrorAction Stop | Select-Object -First 1;if($d){$diskHealth=[string]$d.HealthStatus}}catch{};[PSCustomObject]@{cpuUsagePct=$cpuUsage;gpuUsagePct=$gpuUsage;cpuTempC=$cpuTemp;diskHealth=$diskHealth} | ConvertTo-Json -Compress`
 return new Promise((resolve)=>{
  execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',command],{windowsHide:true,timeout:12000},(err,stdout)=>{
   let result={...emptyBenchmarks}
   if(!err){try{result={...result,...JSON.parse(stdout.trim())}}catch{}}
   execFile('nvidia-smi',['--query-gpu=temperature.gpu','--format=csv,noheader,nounits'],{windowsHide:true,timeout:4000},(nErr,nOut)=>{
    if(!nErr){const parsed=parseInt(String(nOut).trim(),10);if(!Number.isNaN(parsed))result.gpuTempC=parsed}
    resolve(result)
   })
  })
 })
}
function create(){
 win=new BrowserWindow({width:1360,height:840,minWidth:1100,minHeight:700,frame:false,backgroundColor:'#080808',icon:path.join(__dirname,'../build/icon.ico'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,devTools:!app.isPackaged}})
 win.loadURL(app.isPackaged?`file://${path.join(__dirname,'../dist/index.html')}`:'http://127.0.0.1:5173')
 win.on('maximize',()=>win.webContents.send('window:maximized',true))
 win.on('unmaximize',()=>win.webContents.send('window:maximized',false))
 win.on('close',(e)=>{
  if(appSettings.runInBackground && !isQuitting){
   e.preventDefault()
   win.hide()
  }
 })
 if(app.isPackaged){
  Menu.setApplicationMenu(null)
 }
 createTray()
 if(app.isPackaged){
  setupAutoUpdater()
  autoUpdater.checkForUpdates().catch(()=>{})
 }
}
app.on('before-quit',()=>{isQuitting=true})
ipcMain.handle('window:minimize',()=>win.minimize())
ipcMain.handle('window:maximize',()=>{win.isMaximized()?win.unmaximize():win.maximize();return win.isMaximized()})
ipcMain.handle('window:close',()=>win.close())
ipcMain.handle('window:is-maximized',()=>win.isMaximized())
ipcMain.handle('system:summary',async()=>{
 const hw=await getHardwareInfo()
 return {hostname:os.hostname(),platform:process.platform,arch:process.arch,cpuModel:os.cpus()[0]?.model?.trim()||null,cpuThreads:os.cpus().length,memoryGb:Math.round(os.totalmem()/1073741824),freeMemGb:Math.round(os.freemem()/1073741824*10)/10,uptimeHours:Math.round(os.uptime()/3600*10)/10,...hw}
})
ipcMain.handle('optimizations:run',(_event,id)=>{
 if(!isSessionValid())return Promise.reject(new Error('Sessão inválida ou expirada. Faça login novamente.'))
 return runScript(id)
})
ipcMain.handle('optimizations:revert',(_event,id)=>{
 if(!isSessionValid())return Promise.reject(new Error('Sessão inválida ou expirada. Faça login novamente.'))
 return revertScript(id)
})
ipcMain.handle('auth:discord-start',async()=>{
 if(pendingDiscordAuth){try{pendingDiscordAuth.server.close()}catch{}}
 const {tokenPromise,server}=await createDiscordOAuthServer()
 pendingDiscordAuth={server,tokenPromise}
 return {port:DISCORD_OAUTH_PORT}
})
ipcMain.handle('auth:discord-wait',async()=>{
 if(!pendingDiscordAuth)throw new Error('Nenhuma conexão com o Discord em andamento.')
 const {tokenPromise,server}=pendingDiscordAuth
 const timeout=new Promise((_,reject)=>setTimeout(()=>reject(new Error('Tempo esgotado. Tente novamente.')),120000))
 try{
  const params=await Promise.race([tokenPromise,timeout])
  if(!params.access_token)throw new Error(params.error_description||'Conexão com o Discord cancelada ou falhou.')
  return params
 }finally{
  try{server.close()}catch{}
  pendingDiscordAuth=null
 }
})
ipcMain.handle('session:register',(_event,payload)=>{
 currentSession=payload&&typeof payload==='object'?{status:payload.status||null,expiresAt:payload.expiresAt||null}:null
 return true
})
ipcMain.handle('session:clear',()=>{currentSession=null;return true})
ipcMain.handle('app:version',()=>app.getVersion())
ipcMain.handle('startup:get',()=>app.getLoginItemSettings().openAtLogin)
ipcMain.handle('startup:set',(_event,enabled)=>{app.setLoginItemSettings({openAtLogin:!!enabled});return app.getLoginItemSettings().openAtLogin})
ipcMain.handle('background:get',()=>appSettings.runInBackground)
ipcMain.handle('background:set',(_event,enabled)=>{appSettings.runInBackground=!!enabled;writeSettings(appSettings);return appSettings.runInBackground})
ipcMain.handle('system:hwid',()=>getHwid())
ipcMain.handle('system:benchmarks',()=>getBenchmarks())
ipcMain.handle('system:motherboard',()=>getMotherboardInfo())
ipcMain.handle('system:open-external',(_event,url)=>{
 if(typeof url==='string' && /^https:\/\//.test(url))shell.openExternal(url)
})
ipcMain.handle('drivers:list',()=>driverEntries.map((d)=>({id:d.id,name:d.name,description:d.description,available:fs.existsSync(path.join(getDriversDir(),d.file))})))
ipcMain.handle('drivers:install',(_event,id)=>{
 if(!isSessionValid())return Promise.reject(new Error('Sessão inválida ou expirada. Faça login novamente.'))
 const entry=driverEntries.find((d)=>d.id===id)
 if(!entry)return Promise.reject(new Error('Driver desconhecido.'))
 return runDriverInstaller(entry)
})
ipcMain.handle('updates:check',()=>app.isPackaged?autoUpdater.checkForUpdates().catch((e)=>({error:e.message})):Promise.resolve(null))
ipcMain.handle('updates:install',()=>autoUpdater.quitAndInstall())
app.whenReady().then(create)
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()})
