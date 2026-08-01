import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BellOff, RefreshCw, Layers, Zap, Sparkles } from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'

const ICONS = {
  'nvidia-telemetry-off': BellOff,
  'nvidia-driver-restart': RefreshCw,
  'nvidia-shader-cache-clear': Layers,
  'nvidia-power-state-lock': Zap,
  'nvidia-apply-profile': Sparkles
}

const NOTES = {
  'nvidia-driver-restart': 'Seguro: reinicia apenas o serviço do driver, sem afetar suas configurações.',
  'nvidia-shader-cache-clear': 'Ação não reversível. Jogos podem demorar um pouco mais para carregar na próxima execução.',
  'nvidia-apply-profile': 'Ação pontual: aplica um conjunto de ajustes de driver de uma vez. Não possui reversão automática.'
}

const ADVANCED_IDS = ['nvidia-power-state-lock', 'nvidia-apply-profile']

function AdvancedModal({ actions, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.section
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-heading">
          <h3>Otimizações Avançadas NVIDIA</h3>
          <button className="link-button" onClick={onClose}>Fechar</button>
        </div>
        <p className="modal-subtitle">Ajustes de driver mais específicos, recomendados para jogos competitivos.</p>

        {actions.length === 0 ? (
          <p>Nenhuma otimização avançada disponível no momento.</p>
        ) : (
          <section className="metrics opt-grid">
            {actions.map((action) => (
              <OptimizationCard key={action.id} action={action} icon={ICONS[action.id]} note={NOTES[action.id]} />
            ))}
          </section>
        )}

        <p className="modal-credit">Perfil de driver aplicado com NVIDIA Profile Inspector (Orbmu2k, licença MIT).</p>
      </motion.section>
    </div>
  )
}

export default function Nvidia() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: a } = await supabase.from('actions').select('*').eq('enabled', true).eq('category', 'nvidia').order('created_at')
      setActions(a || [])
      setLoading(false)
    }
    load()
  }, [])

  const mainActions = actions.filter((a) => !ADVANCED_IDS.includes(a.id))
  const advancedActions = actions.filter((a) => ADVANCED_IDS.includes(a.id))

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>NVIDIA</small>
          <h1>Otimizações NVIDIA</h1>
          <p>Detectamos uma placa de vídeo NVIDIA no seu sistema. Ajustes específicos para o driver e serviços NVIDIA.</p>
        </div>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : mainActions.length === 0 && advancedActions.length === 0 ? (
        <div className="empty">
          <h2>Em breve</h2>
          <p>Novas otimizações específicas para GPUs NVIDIA estão a caminho.</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {mainActions.map((action) => (
            <OptimizationCard key={action.id} action={action} icon={ICONS[action.id]} note={NOTES[action.id]} />
          ))}
          {advancedActions.length > 0 && (
            <article className="card metric opt-card">
              <Sparkles size={20} />
              <span>Otimizações Avançadas</span>
              <small>Ajustes adicionais de driver, incluindo um perfil otimizado pronto para aplicar.</small>
              <button className="opt-run" onClick={() => setShowAdvanced(true)}>Abrir</button>
            </article>
          )}
        </section>
      )}

      {showAdvanced && <AdvancedModal actions={advancedActions} onClose={() => setShowAdvanced(false)} />}
    </motion.div>
  )
}
