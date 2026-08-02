import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, MonitorCog, HardDrive, RefreshCw, AlertTriangle, Thermometer, Activity, ShieldCheck } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { getLocale } from '../lib/i18n/dynamicText'

function formatUptime(hours) {
  if (hours == null) return '—'
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours % 24)
  return days > 0 ? `${days}d ${rest}h` : `${hours}h`
}

function formatSinceInstall(t, locale, installDate) {
  if (!installDate) return null
  const then = new Date(installDate)
  if (Number.isNaN(then.getTime())) return null
  const days = Math.floor((Date.now() - then.getTime()) / 86400000)
  const dateStr = then.toLocaleDateString(locale)
  if (days < 1) return t('diagnostics.sinceToday', { date: dateStr })
  if (days < 30) return t(days === 1 ? 'diagnostics.sinceDay' : 'diagnostics.sinceDays', { count: days, date: dateStr })
  const months = Math.floor(days / 30)
  return t(months === 1 ? 'diagnostics.sinceMonth' : 'diagnostics.sinceMonths', { count: months, date: dateStr })
}

export default function Diagnostics() {
  const { t, language } = useLanguage()
  const locale = getLocale(language)
  const [s, setS] = useState(null)
  const [b, setB] = useState(null)
  const [loading, setLoading] = useState(true)
  const [benchLoading, setBenchLoading] = useState(true)
  const [checkedAt, setCheckedAt] = useState(null)

  const HEALTH_LABELS = {
    Healthy: t('diagnostics.healthHealthy'),
    Warning: t('diagnostics.healthWarning'),
    Unhealthy: t('diagnostics.healthUnhealthy'),
    Unknown: t('diagnostics.healthUnknown')
  }

  async function load(logHistory) {
    setLoading(true)
    setBenchLoading(true)
    const [data, bench] = await Promise.all([
      window.llz?.system.summary(),
      window.llz?.system.benchmarks()
    ])
    setS(data || null)
    setB(bench || null)
    setCheckedAt(new Date())
    setLoading(false)
    setBenchLoading(false)
    if (logHistory) addHistoryEntry(t('common.diagnosticsRan'))
  }

  useEffect(() => {
    load(false)
  }, [])

  const memUsedPct = s ? Math.round(((s.memoryGb - (s.freeMemGb ?? 0)) / s.memoryGb) * 100) : null
  const diskUsedPct = s?.diskTotalGb ? Math.round(((s.diskTotalGb - (s.diskFreeGb ?? 0)) / s.diskTotalGb) * 100) : null
  const lowDisk = diskUsedPct != null && diskUsedPct >= 90
  const lowMem = memUsedPct != null && memUsedPct >= 90

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('diagnostics.eyebrow')}</small>
          <h1>{t('diagnostics.title')}</h1>
          <p>{t('diagnostics.subtitle')}</p>
        </div>
        <button className="opt-run" disabled={loading} onClick={() => load(true)}>
          <RefreshCw size={14} className={loading ? 'opt-spin' : ''} /> {loading ? t('diagnostics.checking') : t('diagnostics.runButton')}
        </button>
      </header>

      {(lowDisk || lowMem) && (
        <section className="card diag-alert">
          <AlertTriangle size={16} />
          <div>
            {lowDisk && <p>{t('diagnostics.diskAlmostFull', { percent: diskUsedPct })}</p>}
            {lowMem && <p>{t('diagnostics.memAlmostFull', { percent: memUsedPct })}</p>}
          </div>
        </section>
      )}

      <section className="metrics">
        <section className="card metric">
          <Cpu size={20} />
          <span>{t('diagnostics.cpuLabel')}</span>
          <strong>{s?.cpuModel || t('common.loading')}</strong>
          <small>{s ? t('diagnostics.threadsCount', { count: s.cpuThreads }) : ''}</small>
        </section>
        <section className="card metric">
          <MemoryStick size={20} />
          <span>{t('diagnostics.memoryLabel')}</span>
          <strong>{s ? `${s.memoryGb} GB` : t('common.loading')}</strong>
          <small>{memUsedPct != null ? t('diagnostics.memInUse', { percent: memUsedPct }) : ''}</small>
        </section>
        <section className="card metric">
          <MonitorCog size={20} />
          <span>{t('diagnostics.gpuLabel')}</span>
          <strong>{s?.gpu || t('common.notDetected')}</strong>
          <small>{t('diagnostics.gpuDetectedNote')}</small>
        </section>
        <section className="card metric">
          <HardDrive size={20} />
          <span>{s?.diskType && s.diskType !== 'Unspecified' ? s.diskType : t('diagnostics.diskFallbackLabel')}</span>
          <strong>{s?.diskModel || t('common.notDetected')}</strong>
          <small>{diskUsedPct != null ? t('diagnostics.diskUsedOf', { percent: diskUsedPct, total: s.diskTotalGb }) : ''}</small>
        </section>
      </section>

      <div className="section-heading">
        <h3>{t('diagnostics.benchmarksTitle')}</h3>
        {benchLoading && <small>{t('diagnostics.collecting')}</small>}
      </div>
      <section className="metrics">
        <section className="card metric">
          <Activity size={20} />
          <span>{t('diagnostics.cpuUsageLabel')}</span>
          <strong>{b?.cpuUsagePct != null ? `${b.cpuUsagePct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <Activity size={20} />
          <span>{t('diagnostics.gpuUsageLabel')}</span>
          <strong>{b?.gpuUsagePct != null ? `${b.gpuUsagePct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <Thermometer size={20} />
          <span>{t('diagnostics.cpuTempLabel')}</span>
          <strong>{b?.cpuTempC != null ? `${b.cpuTempC}°C` : '—'}</strong>
          <small>{b?.cpuTempC == null ? t('diagnostics.cpuTempUnavailable') : ''}</small>
        </section>
        <section className="card metric">
          <Thermometer size={20} />
          <span>{t('diagnostics.gpuTempLabel')}</span>
          <strong>{b?.gpuTempC != null ? `${b.gpuTempC}°C` : '—'}</strong>
          <small>{b?.gpuTempC == null ? t('diagnostics.gpuTempOnlyNvidia') : ''}</small>
        </section>
        <section className="card metric">
          <MemoryStick size={20} />
          <span>{t('diagnostics.ramUsageLabel')}</span>
          <strong>{memUsedPct != null ? `${memUsedPct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <ShieldCheck size={20} />
          <span>{t('diagnostics.diskHealthLabel')}</span>
          <strong>{b?.diskHealth ? (HEALTH_LABELS[b.diskHealth] || b.diskHealth) : t('diagnostics.healthUnknown')}</strong>
        </section>
        <section className="card metric">
          <HardDrive size={20} />
          <span>{t('diagnostics.diskFreeLabel')}</span>
          <strong>{s?.diskFreeGb != null ? `${s.diskFreeGb} GB` : '—'}</strong>
          <small>{s?.diskTotalGb != null ? t('diagnostics.ofTotalGb', { total: s.diskTotalGb }) : ''}</small>
        </section>
      </section>

      <section className="lower">
        <section className="card">
          <h3>{t('diagnostics.osTitle')}</h3>
          <div className="license">
            <div><span>{t('diagnostics.versionLabel')}</span><strong>{s?.osName || t('dashboard.loadingDevice')}</strong></div>
            <div><span>{t('diagnostics.buildLabel')}</span><strong>{s?.osBuild || '—'}</strong></div>
            <div><span>{t('diagnostics.uptimeLabel')}</span><strong>{formatUptime(s?.uptimeHours)}</strong></div>
            <div><span>{t('diagnostics.sinceInstallLabel')}</span><strong>{formatSinceInstall(t, locale, s?.installDate) || '—'}</strong></div>
          </div>
        </section>
        <section className="card">
          <h3>{t('diagnostics.lastCheckTitle')}</h3>
          <p>{checkedAt ? checkedAt.toLocaleString(locale) : t('diagnostics.neverChecked')}</p>
        </section>
      </section>
    </motion.div>
  )
}
