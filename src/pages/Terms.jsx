import { motion } from 'framer-motion'
import { useLanguage } from '../lib/i18n/LanguageContext'

const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function Terms() {
  const { t } = useLanguage()

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('terms.eyebrow')}</small>
          <h1>{t('terms.title')}</h1>
          <p>{t('terms.lastUpdate')}</p>
        </div>
      </header>

      <section className="card terms-content">
        {SECTIONS.map((n) => (
          <div key={n}>
            <h3>{t(`terms.s${n}Title`)}</h3>
            <p>{t(`terms.s${n}Body`)}</p>
          </div>
        ))}
      </section>
    </motion.div>
  )
}
