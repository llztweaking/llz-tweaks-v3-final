import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, HardDrive } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'

function DriverCard({ driver }) {
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')

  async function install() {
    setStatus('running')
    try {
      const result = await window.llz?.drivers.install(driver.id)
      setStatus('done')
      setOutput(result || 'Concluído.')
      addHistoryEntry(`${driver.name} instalado`)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || 'Falha ao abrir o instalador.')
    }
  }

  return (
    <article className="card metric opt-card">
      <HardDrive size={20} />
      <span>{driver.name}</span>
      <small>{driver.description}</small>

      <button className="opt-run" disabled={status === 'running'} onClick={install}>
        {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : 'Instalar'}
      </button>

      {status === 'running' && (
        <div className="opt-result ok">
          <span>Instalando em segundo plano, pode levar alguns minutos...</span>
        </div>
      )}
      {status === 'done' && output && (
        <div className="opt-result ok">
          <CheckCircle2 size={13} />
          <span>{output}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="opt-result err">
          <XCircle size={13} />
          <span>{output}</span>
        </div>
      )}
      <small className="opt-note">Requer permissão de administrador (UAC).</small>
    </article>
  )
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const list = await window.llz?.drivers.list()
      setDrivers((list || []).filter((d) => d.available))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>DRIVERS</small>
          <h1>Drivers</h1>
          <p>Instaladores oficiais prontos para baixar direto pelo painel.</p>
        </div>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : drivers.length === 0 ? (
        <div className="empty">
          <h2>Em breve</h2>
          <p>Nenhum driver disponível nesta instalação ainda.</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </section>
      )}
    </motion.div>
  )
}
