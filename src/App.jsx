import{useEffect,useState}from'react'
import{Navigate,Route,Routes}from'react-router-dom'
import{AnimatePresence}from'framer-motion'
import AppLayout from'./layouts/AppLayout'
import Splash from'./components/Splash'
import Dashboard from'./pages/Dashboard'
import Placeholder from'./pages/Placeholder'
import About from'./pages/About'
export default function App(){
 const[boot,setBoot]=useState(true)
 useEffect(()=>{const t=setTimeout(()=>setBoot(false),1600);return()=>clearTimeout(t)},[])
 return <><AnimatePresence>{boot&&<Splash/>}</AnimatePresence>{!boot&&<Routes><Route element={<AppLayout/>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Dashboard/>}/>{['optimizations','games','diagnostics','history','settings','admin'].map(p=><Route key={p} path={'/'+p} element={<Placeholder page={p}/>}/>) }<Route path="/about" element={<About/>}/></Route></Routes>}</>
}
