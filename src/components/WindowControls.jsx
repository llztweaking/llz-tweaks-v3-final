import{useEffect,useState}from'react'
import{Minus,Maximize2,Copy,X}from'lucide-react'
export default function WindowControls(){
 const[max,setMax]=useState(false)
 useEffect(()=>{window.llz?.window.isMaximized().then(setMax);return window.llz?.window.onMaximized(setMax)},[])
 return <div className="window-controls">
  <button onClick={()=>window.llz.window.minimize()}><Minus size={15}/></button>
  <button onClick={()=>window.llz.window.maximize()}>{max?<Copy size={13}/>:<Maximize2 size={13}/>}</button>
  <button className="close" onClick={()=>window.llz.window.close()}><X size={15}/></button>
 </div>
}
