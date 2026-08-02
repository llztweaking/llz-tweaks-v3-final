const {contextBridge,ipcRenderer}=require('electron')
contextBridge.exposeInMainWorld('llz',{
 window:{
  minimize:()=>ipcRenderer.invoke('window:minimize'),
  maximize:()=>ipcRenderer.invoke('window:maximize'),
  close:()=>ipcRenderer.invoke('window:close'),
  isMaximized:()=>ipcRenderer.invoke('window:is-maximized'),
  onMaximized:(cb)=>{const fn=(_,v)=>cb(v);ipcRenderer.on('window:maximized',fn);return()=>ipcRenderer.removeListener('window:maximized',fn)}
 },
 system:{summary:()=>ipcRenderer.invoke('system:summary'),hwid:()=>ipcRenderer.invoke('system:hwid'),benchmarks:()=>ipcRenderer.invoke('system:benchmarks'),openExternal:(url)=>ipcRenderer.invoke('system:open-external',url)},
 optimizations:{run:(id)=>ipcRenderer.invoke('optimizations:run',id),revert:(id)=>ipcRenderer.invoke('optimizations:revert',id)},
 app:{version:()=>ipcRenderer.invoke('app:version')},
 startup:{get:()=>ipcRenderer.invoke('startup:get'),set:(enabled)=>ipcRenderer.invoke('startup:set',enabled)},
 background:{get:()=>ipcRenderer.invoke('background:get'),set:(enabled)=>ipcRenderer.invoke('background:set',enabled)},
 motherboard:{get:()=>ipcRenderer.invoke('system:motherboard')},
 drivers:{list:()=>ipcRenderer.invoke('drivers:list'),install:(id)=>ipcRenderer.invoke('drivers:install',id)},
 services:{verifyEssential:()=>ipcRenderer.invoke('services:verify-essential')},
 session:{register:(payload)=>ipcRenderer.invoke('session:register',payload),clear:()=>ipcRenderer.invoke('session:clear')},
 auth:{discordStart:()=>ipcRenderer.invoke('auth:discord-start'),discordWait:()=>ipcRenderer.invoke('auth:discord-wait')},
 updates:{
  check:()=>ipcRenderer.invoke('updates:check'),
  install:()=>ipcRenderer.invoke('updates:install'),
  onStatus:(cb)=>{const fn=(_,v)=>cb(v);ipcRenderer.on('updates:status',fn);return()=>ipcRenderer.removeListener('updates:status',fn)}
 }
})
