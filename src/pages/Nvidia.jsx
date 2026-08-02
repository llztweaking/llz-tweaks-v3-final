import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BellOff, RefreshCw, Layers, Zap, Sparkles } from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'
import { useLanguage } from '../lib/i18n/LanguageContext'

const ICONS = {
  'nvidia-telemetry-off': BellOff,
  'nvidia-driver-restart': RefreshCw,
  'nvidia-shader-cache-clear': Layers,
  'nvidia-power-state-lock': Zap,
  'nvidia-apply-profile': Sparkles
}

const ADVANCED_IDS = ['nvidia-power-state-lock', 'nvidia-apply-profile']

function AdvancedModal({ actions, onClose, t }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.section
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-heading">
          <h3>{t('nvidia.modalTitle')}</h3>
          <button className="link-button" onClick={onClose}>{t('nvidia.close')}</button>
        </div>
        <p className="modal-subtitle">{t('nvidia.modalSubtitle')}</p>

        {actions.length === 0 ? (
          <p>{t('nvidia.noneAvailable')}</p>
        ) : (
          <section className="metrics opt-grid">
            {actions.map((action) => (
              <OptimizationCard key={action.id} action={action} icon={ICONS[action.id]} />
            ))}
          </section>
        )}

        <p className="modal-credit">{t('nvidia.credit')}</p>
      </motion.section>
    </div>
  )
}

export default function Nvidia() {
  const { t } = useLanguage()
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
          <small>{t('nvidia.eyebrow')}</small>
          <h1>{t('nvidia.title')}</h1>
          <p>{t('nvidia.subtitle')}</p>
        </div>
      </header>

      {loading ? (
        <p>{t('common.loading')}</p>
      ) : mainActions.length === 0 && advancedActions.length === 0 ? (
        <div className="empty">
          <h2>{t('common.comingSoon')}</h2>
          <p>{t('nvidia.comingSoonBody')}</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {mainActions.map((action) => (
            <OptimizationCard key={action.id} action={action} icon={ICONS[action.id]} />
          ))}
          {advancedActions.length > 0 && (
            <article className="card metric opt-card">
              <Sparkles size={20} />
              <span>{t('nvidia.advancedTitle')}</span>
              <small>{t('nvidia.advancedDesc')}</small>
              <button className="opt-run" onClick={() => setShowAdvanced(true)}>{t('nvidia.open')}</button>
            </article>
          )}
        </section>
      )}

      {showAdvanced && <AdvancedModal actions={advancedActions} onClose={() => setShowAdvanced(false)} t={t} />}
    </motion.div>
  )
}
