export default function InfoCard({ icon: Icon, title, value, status, statusVariant, hint }) {
  const safeValue = typeof value === 'string' || typeof value === 'number' ? value : null

  return (
    <section className="card metric info-card">
      <Icon size={20} />
      <span>{title}</span>
      <strong>{safeValue || 'Não disponível'}</strong>
      {status && <div className={`badge ${statusVariant || ''}`}>{status}</div>}
      {hint && <small>{hint}</small>}
    </section>
  )
}
