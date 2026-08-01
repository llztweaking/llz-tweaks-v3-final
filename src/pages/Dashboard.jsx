import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, MonitorCog, HardDrive, Zap, Activity } from 'lucide-react'
import { getHistory, getHistoryCount } from '../lib/history'

function formatExpiry(expiresAt, now) {
  if (!expiresAt) return { exact: 'Sem expiração definida', countdown: '', expired: false }
  const target = new Date(expiresAt)
  const exact = target.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const diff = target.getTime() - now
  if (diff <= 0) return { exact, countdown: 'Expirada', expired: true }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`${days}d`)
  parts.push(`${String(hours).padStart(2, '0')}h`, `${String(minutes).padStart(2, '0')}m`, `${String(seconds).padStart(2, '0')}s`)
  return { exact, countdown: `${parts.join(' ')} restantes`, expired: false }
}

export default function Dashboard() {
  const { session } = useOutletContext()
  const navigate = useNavigate()
  const [s, setS] = useState(null)
  const [history, setHistory] = useState([])
  const [historyCount, setHistoryCount] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    window.llz?.system.summary().then(setS)
    setHistory(getHistory().slice(0, 4))
    setHistoryCount(getHistoryCount())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const expiry = formatExpiry(session?.expiresAt, now)

  const diskLabel = s?.diskType && s.diskType !== 'Unspecified' ? s.diskType : 'Disco'
  const cards = [
    ['CPU', s?.cpuModel || 'Detectando...', Cpu, s ? `${s.cpuThreads} threads detectadas` : ''],
    ['RAM', s ? `${s.memoryGb} GB` : 'Detectando...', MemoryStick, 'Memória total instalada'],
    ['GPU', s?.gpu || 'Não detectado', MonitorCog, 'Detectado pelo LLZ Core'],
    [diskLabel, s?.diskModel || 'Não detectado', HardDrive, s?.diskSizeGb ? `${s.diskSizeGb} GB` : '']
  ]

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>VISÃO GERAL</small>
          <h1>Bem-vindo, {session?.discord || 'visitante'}</h1>
          <p>Acompanhe seu sistema, sua licença e as otimizações disponíveis.</p>
        </div>
        <em>{session?.plan ? `PLANO ${session.plan}` : 'SEM PLANO'}</em>
      </header>

      <section className="card hero">
        <div>
          <small>LLZ PERFORMANCE</small>
          <h2>Seu sistema está pronto para receber otimizações.</h2>
          <p>Execute o diagnóstico antes de aplicar um perfil. O LLZ Tweaks preserva o estado anterior para restauração.</p>
          <div className="actions">
            <button onClick={() => navigate('/optimizations')}><Zap size={16} />Executar otimização</button>
            <button className="secondary" onClick={() => navigate('/diagnostics')}><Activity size={16} />Diagnóstico</button>
          </div>
        </div>
        <div className="score">
          <strong>{historyCount}</strong>
          <span>ações aplicadas</span>
          <small>HISTÓRICO REAL</small>
        </div>
      </section>

      <section className="metrics">
        {cards.map(([l, v, I, sub]) => (
          <section className="card metric" key={l}>
            <I size={20} />
            <span>{l}</span>
            <strong>{v}</strong>
            <small>{sub}</small>
          </section>
        ))}
      </section>

      <section className="lower">
        <section className="card">
          <h3>Sua assinatura</h3>
          <div className="license">
            <div><span>Plano</span><strong>{session?.plan || '—'}</strong></div>
            <div><span>Discord</span><strong>{session?.discord || '—'}</strong></div>
            <div><span>Dispositivo</span><strong>{s?.hostname || 'Carregando'}</strong></div>
            <div>
              <span>Expira em</span>
              <strong className={expiry.expired ? 'expiry-warn' : ''}>{expiry.exact}</strong>
              {expiry.countdown && <small className={expiry.expired ? 'expiry-warn' : ''}>{expiry.countdown}</small>}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="section-heading">
            <h3>Últimas ações</h3>
            <button className="link-button" onClick={() => navigate('/history')}>Ver histórico completo</button>
          </div>
          {history.length ? (
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  {h.label}
                  <small>{new Date(h.at).toLocaleString('pt-BR')}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma ação executada ainda. Rode uma otimização para ver o histórico aqui.</p>
          )}
        </section>
      </section>
    </motion.div>
  )
}
