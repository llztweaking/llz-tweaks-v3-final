const {contextBridge,ipcRenderer}=require('electron')
contextBridge.exposeInMainWorld('llz',{
 window:{
  minimize:()=>ipcRenderer.invoke('window:minimize'),
  maximize:()=>ipcRenderer.invoke('window:maximize'),
  close:()=>ipcRenderer.invoke('window:close'),
  isMaximized:()=>ipcRenderer.invoke('window:is-maximized'),
  onMaximized:(cb)=>{const fn=(_,v)=>cb(v);ipcRenderer.on('window:maximized',fn);return()=>ipcRenderer.removeListener('window:maximized',fn)}
 },
 system:{summary:()=>ipcRenderer.invoke('system:summary')}
})
