import { useLanguage } from '../lib/i18n/LanguageContext'

export default function InfoCard({ icon: Icon, title, value, status, statusVariant, hint }) {
  const { t } = useLanguage()
  const safeValue = typeof value === 'string' || typeof value === 'number' ? value : null

  return (
    <section className="card metric info-card">
      <Icon size={20} />
      <span>{title}</span>
      <strong>{safeValue || t('common.notAvailable')}</strong>
      {status && <div className={`badge ${statusVariant || ''}`}>{status}</div>}
      {hint && <small>{hint}</small>}
    </section>
  )
}
