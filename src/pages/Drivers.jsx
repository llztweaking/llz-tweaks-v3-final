import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, HardDrive } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { driverName, driverDescription } from '../lib/i18n/dynamicText'

function DriverCard({ driver, t }) {
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')

  async function install() {
    setStatus('running')
    try {
      const result = await window.llz?.drivers.install(driver.id)
      setStatus('done')
      setOutput(result || t('common.done'))
      addHistoryEntry(`${driverName(t, driver)} ${t('common.historyInstalled')}`)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || t('drivers.installFailed'))
    }
  }

  return (
    <article className="card metric opt-card">
      <HardDrive size={20} />
      <span>{driverName(t, driver)}</span>
      <small>{driverDescription(t, driver)}</small>

      <button className="opt-run" disabled={status === 'running'} onClick={install}>
        {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : t('common.install')}
      </button>

      {status === 'running' && (
        <div className="opt-result ok">
          <span>{t('drivers.installing')}</span>
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
      <small className="opt-note">{t('common.adminRequired')}</small>
    </article>
  )
}

export default function Drivers() {
  const { t } = useLanguage()
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
          <small>{t('drivers.eyebrow')}</small>
          <h1>{t('drivers.title')}</h1>
          <p>{t('drivers.subtitle')}</p>
        </div>
      </header>

      {loading ? (
        <p>{t('common.loading')}</p>
      ) : drivers.length === 0 ? (
        <div className="empty">
          <h2>{t('common.comingSoon')}</h2>
          <p>{t('drivers.comingSoonBody')}</p>
        </div>
      ) : (
        <section className="metrics opt-grid">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} t={t} />
          ))}
        </section>
      )}
    </motion.div>
  )
}
