const {app,BrowserWindow,ipcMain}=require('electron')
const path=require('path'),os=require('os')
let win
function create(){
 win=new BrowserWindow({width:1360,height:840,minWidth:1100,minHeight:700,frame:false,backgroundColor:'#080808',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}})
 win.loadURL(app.isPackaged?`file://${path.join(__dirname,'../dist/index.html')}`:'http://127.0.0.1:5173')
 win.on('maximize',()=>win.webContents.send('window:maximized',true))
 win.on('unmaximize',()=>win.webContents.send('window:maximized',false))
}
ipcMain.handle('window:minimize',()=>win.minimize())
ipcMain.handle('window:maximize',()=>{win.isMaximized()?win.unmaximize():win.maximize();return win.isMaximized()})
ipcMain.handle('window:close',()=>win.close())
ipcMain.handle('window:is-maximized',()=>win.isMaximized())
ipcMain.handle('system:summary',()=>({hostname:os.hostname(),platform:process.platform,arch:process.arch,cpuThreads:os.cpus().length,memoryGb:Math.round(os.totalmem()/1073741824)}))
app.whenReady().then(create)
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()})
