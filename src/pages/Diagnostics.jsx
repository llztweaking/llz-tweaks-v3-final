import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cpu, MemoryStick, MonitorCog, HardDrive, RefreshCw, AlertTriangle, Thermometer, Activity, ShieldCheck } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'

const HEALTH_LABELS = { Healthy: 'Saudável', Warning: 'Atenção', Unhealthy: 'Crítica', Unknown: 'Desconhecida' }

function formatUptime(hours) {
  if (hours == null) return '—'
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours % 24)
  return days > 0 ? `${days}d ${rest}h` : `${hours}h`
}

function formatSinceInstall(installDate) {
  if (!installDate) return null
  const then = new Date(installDate)
  if (Number.isNaN(then.getTime())) return null
  const days = Math.floor((Date.now() - then.getTime()) / 86400000)
  if (days < 1) return `Hoje (${then.toLocaleDateString('pt-BR')})`
  if (days < 30) return `${days} dia${days === 1 ? '' : 's'} (${then.toLocaleDateString('pt-BR')})`
  const months = Math.floor(days / 30)
  return `${months} ${months === 1 ? 'mês' : 'meses'} (${then.toLocaleDateString('pt-BR')})`
}

export default function Diagnostics() {
  const [s, setS] = useState(null)
  const [b, setB] = useState(null)
  const [loading, setLoading] = useState(true)
  const [benchLoading, setBenchLoading] = useState(true)
  const [checkedAt, setCheckedAt] = useState(null)

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
    if (logHistory) addHistoryEntry('Diagnóstico executado')
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
          <small>DIAGNÓSTICO</small>
          <h1>Diagnóstico do sistema</h1>
          <p>Leitura real do seu hardware e do estado atual do Windows.</p>
        </div>
        <button className="opt-run" disabled={loading} onClick={() => load(true)}>
          <RefreshCw size={14} className={loading ? 'opt-spin' : ''} /> {loading ? 'Verificando...' : 'Rodar diagnóstico'}
        </button>
      </header>

      {(lowDisk || lowMem) && (
        <section className="card diag-alert">
          <AlertTriangle size={16} />
          <div>
            {lowDisk && <p>Disco quase cheio ({diskUsedPct}% usado).</p>}
            {lowMem && <p>Memória quase no limite ({memUsedPct}% usada).</p>}
          </div>
        </section>
      )}

      <section className="metrics">
        <section className="card metric">
          <Cpu size={20} />
          <span>CPU</span>
          <strong>{s?.cpuModel || 'Detectando...'}</strong>
          <small>{s ? `${s.cpuThreads} threads` : ''}</small>
        </section>
        <section className="card metric">
          <MemoryStick size={20} />
          <span>Memória</span>
          <strong>{s ? `${s.memoryGb} GB` : 'Detectando...'}</strong>
          <small>{memUsedPct != null ? `${memUsedPct}% em uso` : ''}</small>
        </section>
        <section className="card metric">
          <MonitorCog size={20} />
          <span>GPU</span>
          <strong>{s?.gpu || 'Não detectado'}</strong>
          <small>Detectado pelo LLZ Core</small>
        </section>
        <section className="card metric">
          <HardDrive size={20} />
          <span>{s?.diskType && s.diskType !== 'Unspecified' ? s.diskType : 'Disco'}</span>
          <strong>{s?.diskModel || 'Não detectado'}</strong>
          <small>{diskUsedPct != null ? `${diskUsedPct}% usado de ${s.diskTotalGb} GB` : ''}</small>
        </section>
      </section>

      <div className="section-heading">
        <h3>Benchmarks</h3>
        {benchLoading && <small>Coletando...</small>}
      </div>
      <section className="metrics">
        <section className="card metric">
          <Activity size={20} />
          <span>Uso de CPU</span>
          <strong>{b?.cpuUsagePct != null ? `${b.cpuUsagePct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <Activity size={20} />
          <span>Uso de GPU</span>
          <strong>{b?.gpuUsagePct != null ? `${b.gpuUsagePct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <Thermometer size={20} />
          <span>Temperatura da CPU</span>
          <strong>{b?.cpuTempC != null ? `${b.cpuTempC}°C` : '—'}</strong>
          <small>{b?.cpuTempC == null ? 'Não exposto por este hardware' : ''}</small>
        </section>
        <section className="card metric">
          <Thermometer size={20} />
          <span>Temperatura da GPU</span>
          <strong>{b?.gpuTempC != null ? `${b.gpuTempC}°C` : '—'}</strong>
          <small>{b?.gpuTempC == null ? 'Disponível apenas em GPUs NVIDIA' : ''}</small>
        </section>
        <section className="card metric">
          <MemoryStick size={20} />
          <span>Uso da RAM</span>
          <strong>{memUsedPct != null ? `${memUsedPct}%` : '—'}</strong>
        </section>
        <section className="card metric">
          <ShieldCheck size={20} />
          <span>Saúde do disco (SMART)</span>
          <strong>{b?.diskHealth ? (HEALTH_LABELS[b.diskHealth] || b.diskHealth) : 'Desconhecida'}</strong>
        </section>
        <section className="card metric">
          <HardDrive size={20} />
          <span>Espaço livre em disco</span>
          <strong>{s?.diskFreeGb != null ? `${s.diskFreeGb} GB` : '—'}</strong>
          <small>{s?.diskTotalGb != null ? `de ${s.diskTotalGb} GB totais` : ''}</small>
        </section>
      </section>

      <section className="lower">
        <section className="card">
          <h3>Sistema operacional</h3>
          <div className="license">
            <div><span>Versão</span><strong>{s?.osName || 'Carregando'}</strong></div>
            <div><span>Build</span><strong>{s?.osBuild || '—'}</strong></div>
            <div><span>Tempo ligado</span><strong>{formatUptime(s?.uptimeHours)}</strong></div>
            <div><span>Formatado há</span><strong>{formatSinceInstall(s?.installDate) || '—'}</strong></div>
          </div>
        </section>
        <section className="card">
          <h3>Última verificação</h3>
          <p>{checkedAt ? checkedAt.toLocaleString('pt-BR') : 'Ainda não verificado.'}</p>
        </section>
      </section>
    </motion.div>
  )
}
