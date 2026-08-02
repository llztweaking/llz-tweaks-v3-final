import { motion } from 'framer-motion'
import { RefreshCw, Factory, CircuitBoard, Building2, Tag, CalendarClock, Microchip, MemoryStick, Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useMotherboardInfo } from '../hooks/useMotherboardInfo'
import InfoCard from '../components/InfoCard'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { getLocale } from '../lib/i18n/dynamicText'

function getBiosStatus(t, biosDate) {
  if (!biosDate) return { label: t('motherboard.statusUnknown'), variant: 'disabled' }
  const date = new Date(biosDate)
  if (Number.isNaN(date.getTime())) return { label: t('motherboard.statusUnknown'), variant: 'disabled' }
  const ageYears = (Date.now() - date.getTime()) / (365.25 * 86400000)
  return ageYears > 3 ? { label: t('motherboard.statusOld'), variant: 'pending' } : { label: t('motherboard.statusUpdated'), variant: 'active' }
}

function getDetectedStatus(t, value) {
  return value ? { label: t('motherboard.statusDetected'), variant: 'active' } : { label: t('motherboard.statusNotAvailable'), variant: 'disabled' }
}

function getActivationStatus(t, status) {
  if (status == null) return { label: t('motherboard.statusUnknown'), variant: 'disabled' }
  return status === 1 ? { label: t('motherboard.statusActivated'), variant: 'active' } : { label: t('motherboard.statusNotActivated'), variant: 'blocked' }
}

function formatBiosDate(locale, biosDate) {
  if (!biosDate) return null
  const date = new Date(biosDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale)
}

function formatActivation(t, status) {
  if (status == null) return null
  return status === 1 ? t('motherboard.statusActivated') : t('motherboard.statusNotActivated')
}

export default function Motherboard() {
  const { t, language } = useLanguage()
  const locale = getLocale(language)
  const { data, loading, error, checkedAt, refresh } = useMotherboardInfo()

  const biosStatus = getBiosStatus(t, data?.biosDate)
  const ramStatus = getDetectedStatus(t, data?.ramTotalGb)
  const ramSpeedStatus = getDetectedStatus(t, data?.ramSpeedMhz)
  const activationStatus = getActivationStatus(t, data?.windowsActivationStatus)

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('motherboard.eyebrow')}</small>
          <h1>{t('motherboard.title')}</h1>
          <p>{t('motherboard.subtitle')}</p>
        </div>
        <button className="opt-run" disabled={loading} onClick={refresh}>
          <RefreshCw size={14} className={loading ? 'opt-spin' : ''} /> {loading ? t('motherboard.reading') : t('motherboard.refreshButton')}
        </button>
      </header>

      {error && (
        <section className="card diag-alert">
          <AlertTriangle size={16} />
          <div><p>{error}</p></div>
        </section>
      )}

      <section className="metrics">
        <InfoCard icon={Factory} title={t('motherboard.fieldBoardManufacturer')} value={data?.boardManufacturer} />
        <InfoCard icon={CircuitBoard} title={t('motherboard.fieldBoardModel')} value={data?.boardModel} />
        <InfoCard icon={Building2} title={t('motherboard.fieldBiosManufacturer')} value={data?.biosManufacturer} />
        <InfoCard icon={Tag} title={t('motherboard.fieldBiosVersion')} value={data?.biosVersion} />
        <InfoCard
          icon={CalendarClock}
          title={t('motherboard.fieldBiosDate')}
          value={formatBiosDate(locale, data?.biosDate)}
          status={biosStatus.label}
          statusVariant={biosStatus.variant}
          hint={t('motherboard.biosDateHint')}
        />
        <InfoCard icon={Microchip} title={t('motherboard.fieldChipset')} value={data?.chipset} />
        <InfoCard
          icon={MemoryStick}
          title={t('motherboard.fieldRamInstalled')}
          value={data?.ramTotalGb ? `${data.ramTotalGb} GB` : null}
          status={ramStatus.label}
          statusVariant={ramStatus.variant}
        />
        <InfoCard
          icon={Zap}
          title={t('motherboard.fieldRamSpeed')}
          value={data?.ramSpeedMhz ? `${data.ramSpeedMhz} MHz` : null}
          status={ramSpeedStatus.label}
          statusVariant={ramSpeedStatus.variant}
        />
        <InfoCard
          icon={ShieldCheck}
          title={t('motherboard.fieldWindowsActivation')}
          value={formatActivation(t, data?.windowsActivationStatus)}
          status={activationStatus.label}
          statusVariant={activationStatus.variant}
        />
      </section>

      <section className="card">
        <h3>{t('diagnostics.lastCheckTitle')}</h3>
        <p>{checkedAt ? checkedAt.toLocaleString(locale) : t('diagnostics.neverChecked')}</p>
      </section>
    </motion.div>
  )
}
