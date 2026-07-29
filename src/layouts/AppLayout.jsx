import{useState}from'react'
import{NavLink,Outlet,useLocation}from'react-router-dom'
import{LayoutDashboard,SlidersHorizontal,Gamepad2,Activity,History,Settings,ShieldCheck,Info,PanelLeftClose,PanelLeftOpen}from'lucide-react'
import Brand from'../components/Brand'
import Background from'../components/Background'
import WindowControls from'../components/WindowControls'
const nav=[['/dashboard','Dashboard',LayoutDashboard],['/optimizations','Otimizações',SlidersHorizontal],['/games','Jogos',Gamepad2],['/diagnostics','Diagnóstico',Activity],['/history','Histórico',History],['/settings','Configurações',Settings],['/admin','Admin',ShieldCheck],['/about','Sobre',Info]]
export default function AppLayout(){
 const[c,setC]=useState(false),loc=useLocation()
 return <div className="shell"><Background/><header className="titlebar"><div><Brand compact/><span>{nav.find(x=>x[0]===loc.pathname)?.[1]||'LLZ Tweaks'}</span></div><small>LLZ Tweaks 3.0.0</small><WindowControls/></header><div className="body"><aside className={c?'sidebar collapsed':'sidebar'}><div className="side-top"><Brand compact={c}/><button onClick={()=>setC(!c)}>{c?<PanelLeftOpen size={17}/>:<PanelLeftClose size={17}/>}</button></div><nav>{nav.map(([to,label,Icon])=><NavLink key={to} to={to} title={c?label:''} className={({isActive})=>isActive?'active':''}><i/><Icon size={18}/>{!c&&<span>{label}</span>}</NavLink>)}</nav><div className="user"><b>R</b>{!c&&<div><strong>Rodrigues</strong><span>EXTREME</span></div>}</div></aside><main className="content"><Outlet/></main></div></div>
}
