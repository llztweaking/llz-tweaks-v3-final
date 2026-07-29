import{useEffect,useState}from'react'
import{motion}from'framer-motion'
import{Cpu,MemoryStick,MonitorCog,HardDrive,Zap,Activity}from'lucide-react'
const cards=[['CPU','Ryzen 7 9800X3D',Cpu],['RAM','64 GB DDR5',MemoryStick],['GPU','RTX 5070 OC',MonitorCog],['SSD','1 TB NVMe',HardDrive]]
export default function Dashboard(){
 const[s,setS]=useState(null);useEffect(()=>{window.llz?.system.summary().then(setS)},[])
 return <motion.div className="page" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
  <header className="page-head"><div><small>VISÃO GERAL</small><h1>Bem-vindo, Rodrigues</h1><p>Acompanhe seu sistema, sua licença e as otimizações disponíveis.</p></div><em>PLANO EXTREME</em></header>
  <section className="card hero"><div><small>LLZ PERFORMANCE</small><h2>Seu sistema está pronto para receber otimizações.</h2><p>Execute o diagnóstico antes de aplicar um perfil. O LLZ Tweaks preserva o estado anterior para restauração.</p><div className="actions"><button><Zap size={16}/>Executar otimização</button><button className="secondary"><Activity size={16}/>Diagnóstico</button></div></div><div className="score"><strong>94</strong><span>de 100</span><small>ESTADO DO SISTEMA</small></div></section>
  <section className="metrics">{cards.map(([l,v,I])=><section className="card metric" key={l}><I size={20}/><span>{l}</span><strong>{v}</strong><small>{l==='CPU'?(s?.cpuThreads||16)+' threads detectadas':'Detectado pelo LLZ Core'}</small></section>)}</section>
  <section className="lower"><section className="card"><h3>Sua assinatura</h3><div className="license"><div><span>Plano</span><strong>EXTREME</strong></div><div><span>Validade</span><strong>29 dias</strong></div><div><span>Dispositivo</span><strong>{s?.hostname||'Carregando'}</strong></div></div></section><section className="card"><h3>Últimas ações</h3><ul><li>Diagnóstico concluído <small>Hoje, 14:32</small></li><li>Perfil competitivo aplicado <small>Ontem, 22:18</small></li><li>Backup criado <small>Ontem, 22:17</small></li></ul></section></section>
 </motion.div>
}
