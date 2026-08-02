import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Layers } from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'
import { useLanguage } from '../lib/i18n/LanguageContext'

const ICONS = {
  'amd-events-restart': RefreshCw,
  'amd-shader-cache-clear': Layers
}

export default function Amd() {
  const { t } = useLanguage()
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
          <small>{t('amd.eyebrow')}</small>
          <h1>{t('amd.title')}</h1>
          <p>{t('amd.subtitle')}</p>
        </div>
      </header>

      {loading ? (
        <p>{t('common.loading')}</p>
      ) : actions.length === 0 ? (
        <div className="empty">
          <h2>{t('common.comingSoon')}</h2>
          <p>{t('amd.comingSoonBody')}</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {actions.map((action) => (
            <OptimizationCard
              key={action.id}
              action={action}
              icon={ICONS[action.id]}
            />
          ))}
        </section>
      )}
    </motion.div>
  )
}
