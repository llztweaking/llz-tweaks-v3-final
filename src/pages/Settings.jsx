import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, RefreshCw, DownloadCloud, CheckCircle2, Languages } from 'lucide-react'
import { BR, PT, US, ES, FR, IT } from 'country-flag-icons/react/3x2'
import { clearHistory } from '../lib/history'
import { useLanguage } from '../lib/i18n/LanguageContext'

const FLAG_ICONS = { BR, PT, US, ES, FR, IT }

export default function Settings() {
  const { session } = useOutletContext()
  const navigate = useNavigate()
  const { t, language, setLanguage, languages } = useLanguage()
  const [version, setVersion] = useState('')
  const [startup, setStartup] = useState(false)
  const [background, setBackground] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [update, setUpdate] = useState(null)
  const [checking, setChecking] = useState(false)

  const UPDATE_LABELS = {
    'up-to-date': t('settings.statusUpToDate'),
    available: t('settings.statusAvailable'),
    downloading: t('settings.statusDownloading'),
    ready: t('settings.statusReady'),
    error: t('settings.statusError')
  }

  useEffect(() => {
    window.llz?.app.version().then(setVersion)
    window.llz?.startup.get().then(setStartup)
    window.llz?.background.get().then(setBackground)
    const unsubscribe = window.llz?.updates.onStatus((data) => {
      setUpdate(data)
      setChecking(false)
    })
    return () => unsubscribe?.()
  }, [])

  async function checkForUpdates() {
    setChecking(true)
    setUpdate(null)
    const result = await window.llz?.updates.check()
    if (!result) setChecking(false)
  }

  async function toggleStartup() {
    const next = !startup
    const applied = await window.llz?.startup.set(next)
    setStartup(applied ?? next)
  }

  async function toggleBackground() {
    const next = !background
    const applied = await window.llz?.background.set(next)
    setBackground(applied ?? next)
  }

  function handleClearHistory() {
    clearHistory()
    setCleared(true)
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('settings.eyebrow')}</small>
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
        </div>
      </header>

      <section className="card">
        <h3>{t('settings.updatesTitle')}</h3>
        <div className="settings-row">
          <div>
            <strong>{t('settings.installedVersion', { version: version || '—' })}</strong>
            <span>{update ? UPDATE_LABELS[update.status] : t('settings.autoChecked')}</span>
          </div>
          {update?.status === 'ready' ? (
            <button className="opt-run" onClick={() => window.llz?.updates.install()}>
              <DownloadCloud size={14} /> {t('settings.installButton')}
            </button>
          ) : (
            <button className="opt-run" disabled={checking} onClick={checkForUpdates}>
              <RefreshCw size={14} className={checking ? 'opt-spin' : ''} /> {checking ? t('settings.checking') : t('settings.checkButton')}
            </button>
          )}
        </div>
        {update?.status === 'downloading' && (
          <div className="opt-result ok">
            <span>{t('settings.percentDownloaded', { percent: update.percent })}</span>
          </div>
        )}
      </section>

      <section className="card">
        <h3><Languages size={15} style={{ verticalAlign: '-2px', marginRight: 7 }} />{t('settings.languageTitle')}</h3>
        <p className="modal-subtitle" style={{ margin: '-8px 0 12px' }}>{t('settings.languageSubtitle')}</p>
        <div className="language-grid">
          {languages.map((lng) => {
            const FlagIcon = FLAG_ICONS[lng.flagCountry]
            return (
              <motion.button
                key={lng.code}
                type="button"
                className={lng.code === language ? 'language-card active' : 'language-card'}
                style={{ '--flag-c1': lng.colors?.[0], '--flag-c2': lng.colors?.[1] }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(lng.code)}
              >
                <span className="language-flag">{FlagIcon && <FlagIcon title={lng.region} />}</span>
                <span className="language-card-info">
                  <strong>{lng.name}</strong>
                  <span>{lng.region}</span>
                </span>
                {lng.code === language && <CheckCircle2 size={16} className="language-check" />}
              </motion.button>
            )
          })}
        </div>
      </section>

      <section className="lower">
        <section className="card">
          <h3>{t('settings.appTitle')}</h3>
          <div className="settings-row">
            <div>
              <strong>{t('settings.startupTitle')}</strong>
              <span>{t('settings.startupDesc')}</span>
            </div>
            <button className={startup ? 'toggle on' : 'toggle'} onClick={toggleStartup}>
              <i />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t('settings.backgroundTitle')}</strong>
              <span>{t('settings.backgroundDesc')}</span>
            </div>
            <button className={background ? 'toggle on' : 'toggle'} onClick={toggleBackground}>
              <i />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>{t('settings.clearHistoryTitle')}</strong>
              <span>{t('settings.clearHistoryDesc')}</span>
            </div>
            <button className="opt-run" onClick={handleClearHistory}>
              <Trash2 size={14} /> {t('settings.clearButton')}
            </button>
          </div>
          {cleared && (
            <div className="opt-result ok">
              <span>{t('settings.historyCleared')}</span>
            </div>
          )}
        </section>

        <section className="card">
          <h3>{t('settings.accountTitle')}</h3>
          <div className="license">
            <div><span>{t('settings.accountPlan')}</span><strong>{session?.plan || '—'}</strong></div>
            <div><span>{t('settings.accountDiscord')}</span><strong>{session?.discord || '—'}</strong></div>
            <div><span>{t('settings.accountAppVersion')}</span><strong>{version || '—'}</strong></div>
          </div>
          <button className="link-button" onClick={() => navigate('/terms')}>{t('settings.termsButton')}</button>
        </section>
      </section>
    </motion.div>
  )
}
