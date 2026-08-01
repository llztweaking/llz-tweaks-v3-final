import { motion } from 'framer-motion'
import { RefreshCw, Factory, CircuitBoard, Building2, Tag, CalendarClock, Microchip, MemoryStick, Zap, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useMotherboardInfo } from '../hooks/useMotherboardInfo'
import InfoCard from '../components/InfoCard'

function getBiosStatus(biosDate) {
  if (!biosDate) return { label: 'Desconhecida', variant: 'disabled' }
  const date = new Date(biosDate)
  if (Number.isNaN(date.getTime())) return { label: 'Desconhecida', variant: 'disabled' }
  const ageYears = (Date.now() - date.getTime()) / (365.25 * 86400000)
  return ageYears > 3 ? { label: 'Antiga', variant: 'pending' } : { label: 'Atualizada', variant: 'active' }
}

function getDetectedStatus(value) {
  return value ? { label: 'Detectado', variant: 'active' } : { label: 'Não disponível', variant: 'disabled' }
}

function getActivationStatus(status) {
  if (status == null) return { label: 'Desconhecido', variant: 'disabled' }
  return status === 1 ? { label: 'Ativado', variant: 'active' } : { label: 'Não ativado', variant: 'blocked' }
}

function formatBiosDate(biosDate) {
  if (!biosDate) return null
  const date = new Date(biosDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR')
}

function formatActivation(status) {
  if (status == null) return null
  return status === 1 ? 'Ativado' : 'Não ativado'
}

export default function Motherboard() {
  const { data, loading, error, checkedAt, refresh } = useMotherboardInfo()

  const biosStatus = getBiosStatus(data?.biosDate)
  const ramStatus = getDetectedStatus(data?.ramTotalGb)
  const ramSpeedStatus = getDetectedStatus(data?.ramSpeedMhz)
  const activationStatus = getActivationStatus(data?.windowsActivationStatus)

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>PLACA MÃE/BIOS</small>
          <h1>Placa Mãe/BIOS</h1>
          <p>Leitura real do hardware da sua placa-mãe e do estado da BIOS.</p>
        </div>
        <button className="opt-run" disabled={loading} onClick={refresh}>
          <RefreshCw size={14} className={loading ? 'opt-spin' : ''} /> {loading ? 'Lendo...' : 'Atualizar informações'}
        </button>
      </header>

      {error && (
        <section className="card diag-alert">
          <AlertTriangle size={16} />
          <div><p>{error}</p></div>
        </section>
      )}

      <section className="metrics">
        <InfoCard icon={Factory} title="Fabricante da Placa-Mãe" value={data?.boardManufacturer} />
        <InfoCard icon={CircuitBoard} title="Modelo da Placa-Mãe" value={data?.boardModel} />
        <InfoCard icon={Building2} title="Fabricante da BIOS" value={data?.biosManufacturer} />
        <InfoCard icon={Tag} title="Versão da BIOS" value={data?.biosVersion} />
        <InfoCard
          icon={CalendarClock}
          title="Data da BIOS"
          value={formatBiosDate(data?.biosDate)}
          status={biosStatus.label}
          statusVariant={biosStatus.variant}
          hint="Status baseado na idade da versão instalada."
        />
        <InfoCard icon={Microchip} title="Chipset" value={data?.chipset} />
        <InfoCard
          icon={MemoryStick}
          title="Memória RAM Instalada"
          value={data?.ramTotalGb ? `${data.ramTotalGb} GB` : null}
          status={ramStatus.label}
          statusVariant={ramStatus.variant}
        />
        <InfoCard
          icon={Zap}
          title="Velocidade da Memória"
          value={data?.ramSpeedMhz ? `${data.ramSpeedMhz} MHz` : null}
          status={ramSpeedStatus.label}
          statusVariant={ramSpeedStatus.variant}
        />
        <InfoCard
          icon={ShieldCheck}
          title="Ativação do Windows"
          value={formatActivation(data?.windowsActivationStatus)}
          status={activationStatus.label}
          statusVariant={activationStatus.variant}
        />
      </section>

      <section className="card">
        <h3>Última verificação</h3>
        <p>{checkedAt ? checkedAt.toLocaleString('pt-BR') : 'Ainda não verificado.'}</p>
      </section>
    </motion.div>
  )
}
