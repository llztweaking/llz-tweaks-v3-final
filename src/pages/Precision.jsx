import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cog } from 'lucide-react'
import HoloMouse from '../components/HoloMouse'
import { useLanguage } from '../lib/i18n/LanguageContext'

export default function Precision() {
  const { t } = useLanguage()
  const [glitching, setGlitching] = useState(true)

  useEffect(() => {
    const settle = setTimeout(() => setGlitching(false), 500)
    return () => clearTimeout(settle)
  }, [])

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('precision.eyebrow')}</small>
          <h1>{t('precision.title')}</h1>
          <p>{t('precision.subtitle')}</p>
        </div>
      </header>

      <div className="precision-page">
        <HoloMouse />
        <div className="precision-soon">
          <p className={'glitch-text' + (glitching ? ' glitching' : '')} data-text="coming soon..">
            coming soon..
          </p>
          <Cog size={20} className="precision-gear" />
        </div>
      </div>
    </motion.div>
  )
}
