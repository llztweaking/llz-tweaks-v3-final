import{useEffect,useState}from'react'
import{Navigate,Route,Routes}from'react-router-dom'
import{AnimatePresence}from'framer-motion'
import AppLayout from'./layouts/AppLayout'
import Splash from'./components/Splash'
import Login from'./pages/Login'
import Register from'./pages/Register'
import Dashboard from'./pages/Dashboard'
import Optimizations from'./pages/Optimizations'
import Games from'./pages/Games'
import Diagnostics from'./pages/Diagnostics'
import History from'./pages/History'
import Settings from'./pages/Settings'
import Admin from'./pages/Admin'
import Terms from'./pages/Terms'
import About from'./pages/About'
import Nvidia from'./pages/Nvidia'
import Amd from'./pages/Amd'
import Precision from'./pages/Precision'
import Motherboard from'./pages/Motherboard'
import Drivers from'./pages/Drivers'
export default function App(){
 const[boot,setBoot]=useState(true)
 const[session,setSession]=useState(null)
 const[preAuthScreen,setPreAuthScreen]=useState('login')
 useEffect(()=>{const t=setTimeout(()=>setBoot(false),1600);return()=>clearTimeout(t)},[])
 return <><AnimatePresence>{boot&&<Splash/>}</AnimatePresence>{!boot&&(session?<Routes><Route element={<AppLayout session={session} onLogout={()=>setSession(null)} onSessionUpdate={(patch)=>setSession((s)=>s?{...s,...patch}:s)}/>}><Route index element={<Navigate to="/dashboard" replace/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/optimizations" element={<Optimizations/>}/><Route path="/games" element={<Games/>}/><Route path="/diagnostics" element={<Diagnostics/>}/><Route path="/history" element={<History/>}/><Route path="/settings" element={<Settings/>}/><Route path="/admin" element={<Admin/>}/><Route path="/terms" element={<Terms/>}/><Route path="/nvidia" element={<Nvidia/>}/><Route path="/amd" element={<Amd/>}/><Route path="/precision" element={<Precision/>}/><Route path="/motherboard" element={<Motherboard/>}/><Route path="/drivers" element={<Drivers/>}/><Route path="/about" element={<About/>}/></Route></Routes>:preAuthScreen==='register'?<Register onBack={()=>setPreAuthScreen('login')} onRegistered={()=>setPreAuthScreen('login')}/>:<Login onLogin={setSession} onRegisterClick={()=>setPreAuthScreen('register')}/>)}</>
}
