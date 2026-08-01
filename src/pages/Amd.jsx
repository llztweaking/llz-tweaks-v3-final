import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Layers } from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'

const ICONS = {
  'amd-events-restart': RefreshCw,
  'amd-shader-cache-clear': Layers
}

const NOTES = {
  'amd-events-restart': 'Seguro: reinicia apenas o serviço de eventos do Radeon Software, sem afetar suas configurações.',
  'amd-shader-cache-clear': 'Ação não reversível. Jogos podem demorar um pouco mais para carregar na próxima execução.'
}

export default function Amd() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: a } = await supabase.from('actions').select('*').eq('enabled', true).eq('category', 'amd').order('created_at')
      setActions(a || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>AMD</small>
          <h1>Otimizações AMD</h1>
          <p>Detectamos uma placa de vídeo AMD no seu sistema. Ajustes específicos para o driver e serviços AMD.</p>
        </div>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : actions.length === 0 ? (
        <div className="empty">
          <h2>Em breve</h2>
          <p>Novas otimizações específicas para GPUs AMD estão a caminho.</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {actions.map((action) => (
            <OptimizationCard
              key={action.id}
              action={action}
              icon={ICONS[action.id]}
              note={NOTES[action.id]}
            />
          ))}
        </section>
      )}
    </motion.div>
  )
}
