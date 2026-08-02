import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, MonitorCog, HardDrive, Zap, Activity } from 'lucide-react'
import { getHistory, getHistoryCount } from '../lib/history'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { getLocale } from '../lib/i18n/dynamicText'

function formatExpiry(t, locale, expiresAt, now) {
  if (!expiresAt) return { exact: t('dashboard.noExpiry'), countdown: '', expired: false }
  const target = new Date(expiresAt)
  const exact = target.toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })
  const diff = target.getTime() - now
  if (diff <= 0) return { exact, countdown: t('dashboard.expired'), expired: true }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (days) parts.push(`${days}d`)
  parts.push(`${String(hours).padStart(2, '0')}h`, `${String(minutes).padStart(2, '0')}m`, `${String(seconds).padStart(2, '0')}s`)
  return { exact, countdown: t('dashboard.remaining', { time: parts.join(' ') }), expired: false }
}

export default function Dashboard() {
  const { t, language } = useLanguage()
  const locale = getLocale(language)
  const { session } = useOutletContext()
  const navigate = useNavigate()
  const [s, setS] = useState(null)
  const [history, setHistory] = useState([])
  const [historyCount, setHistoryCount] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    window.llz?.system.summary().then(setS)
    setHistory(getHistory().slice(0, 4))
    setHistoryCount(getHistoryCount())
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const expiry = formatExpiry(t, locale, session?.expiresAt, now)

  const diskLabel = s?.diskType && s.diskType !== 'Unspecified' ? s.diskType : t('dashboard.cardDisk')
  const cards = [
    [t('dashboard.cardCpu'), s?.cpuModel || t('common.loading'), Cpu, s ? t('dashboard.threadsDetected', { count: s.cpuThreads }) : ''],
    [t('dashboard.cardRam'), s ? `${s.memoryGb} GB` : t('common.loading'), MemoryStick, t('dashboard.ramTotalInstalled')],
    [t('dashboard.cardGpu'), s?.gpu || t('common.notDetected'), MonitorCog, t('dashboard.detectedByCore')],
    [diskLabel, s?.diskModel || t('common.notDetected'), HardDrive, s?.diskSizeGb ? `${s.diskSizeGb} GB` : '']
  ]

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('dashboard.eyebrow')}</small>
          <h1>{t('dashboard.welcomeTitle', { name: session?.discord || t('dashboard.guestFallback') })}</h1>
          <p>{t('dashboard.subtitle')}</p>
        </div>
        <em>{session?.plan ? t('dashboard.planPrefix', { plan: session.plan }) : t('dashboard.noPlan')}</em>
      </header>

      <section className="card hero">
        <div>
          <small>{t('dashboard.heroEyebrow')}</small>
          <h2>{t('dashboard.heroTitle')}</h2>
          <p>{t('dashboard.heroBody')}</p>
          <div className="actions">
            <button onClick={() => navigate('/optimizations')}><Zap size={16} />{t('dashboard.runOptimization')}</button>
            <button className="secondary" onClick={() => navigate('/diagnostics')}><Activity size={16} />{t('dashboard.diagnosticsButton')}</button>
          </div>
        </div>
        <div className="score">
          <strong>{historyCount}</strong>
          <span>{t('dashboard.actionsApplied')}</span>
          <small>{t('dashboard.realHistory')}</small>
        </div>
      </section>

      <section className="metrics">
        {cards.map(([l, v, I, sub]) => (
          <section className="card metric" key={l}>
            <I size={20} />
            <span>{l}</span>
            <strong>{v}</strong>
            <small>{sub}</small>
          </section>
        ))}
      </section>

      <section className="lower">
        <section className="card">
          <h3>{t('dashboard.subscriptionTitle')}</h3>
          <div className="license">
            <div><span>{t('dashboard.planLabel')}</span><strong>{session?.plan || '—'}</strong></div>
            <div><span>{t('dashboard.discordLabel')}</span><strong>{session?.discord || '—'}</strong></div>
            <div><span>{t('dashboard.deviceLabel')}</span><strong>{s?.hostname || t('dashboard.loadingDevice')}</strong></div>
            <div>
              <span>{t('dashboard.expiresLabel')}</span>
              <strong className={expiry.expired ? 'expiry-warn' : ''}>{expiry.exact}</strong>
              {expiry.countdown && <small className={expiry.expired ? 'expiry-warn' : ''}>{expiry.countdown}</small>}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="section-heading">
            <h3>{t('dashboard.lastActionsTitle')}</h3>
            <button className="link-button" onClick={() => navigate('/history')}>{t('dashboard.viewFullHistory')}</button>
          </div>
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
            <p>{t('dashboard.noActionsYet')}</p>
          )}
        </section>
      </section>
    </motion.div>
  )
}
