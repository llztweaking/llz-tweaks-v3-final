import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { getHistory, clearHistory } from '../lib/history'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { getLocale } from '../lib/i18n/dynamicText'

export default function History() {
  const { t, language } = useLanguage()
  const locale = getLocale(language)
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  function handleClear() {
    clearHistory()
    setHistory([])
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('history.eyebrow')}</small>
          <h1>{t('history.title')}</h1>
          <p>{t('history.subtitle')}</p>
        </div>
        {history.length > 0 && (
          <button className="opt-run" onClick={handleClear}>
            <Trash2 size={14} /> {t('history.clearButton')}
          </button>
        )}
      </header>

      <section className="card">
        {history.length ? (
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {h.label}
                <small>{new Date(h.at).toLocaleString(locale)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <h2>{t('history.emptyTitle')}</h2>
            <p>{t('history.emptyBody')}</p>
          </div>
        )}
      </section>
    </motion.div>
  )
}
