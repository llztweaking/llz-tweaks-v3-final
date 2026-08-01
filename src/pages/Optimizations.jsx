import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RotateCcw, Trash2, Gauge, Loader2,
  Gamepad2, RefreshCw, MousePointer2, Keyboard, Sparkles, Zap, Wifi, Network,
  HardDrive, Layers, Download, Image as ImageIcon, ShieldCheck, Wrench, MemoryStick, Clock, Timer,
  Rocket, Eraser, PlayCircle, CheckCircle2
} from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'

const ICONS = {
  'restore-defaults': RotateCcw,
  'safe-cleanup': Trash2,
  'competitive-profile': Gauge,
  'game-mode-on': Gamepad2,
  'gamebar-off': Gamepad2,
  'explorer-restart': RefreshCw,
  'mouse-accel-off': MousePointer2,
  'keyboard-accessibility-off': Keyboard,
  'visual-performance': Sparkles,
  'ultimate-performance': Zap,
  'dns-flush': Wifi,
  'ip-renew': Wifi,
  'winsock-reset': Network,
  'tcpip-reset': Network,
  'empty-recycle-bin': Trash2,
  'clear-prefetch': Trash2,
  'open-disk-cleanup': HardDrive,
  'dx-shader-cache-clear': Layers,
  'windows-update-cache-clear': Download,
  'thumbcache-clear': ImageIcon,
  'sfc-scan': ShieldCheck,
  'dism-repair': Wrench,
  'chkdsk-schedule': HardDrive,
  'memory-usage-performance': MemoryStick,
  'platform-tick-on': Clock,
  'disable-dynamictick-on': Timer,
  'input-lag-off': Rocket,
  'standby-list-clear': Eraser,
  'restore-essential-services': ShieldCheck,
  'keyboard-input-lag-off': Keyboard,
  'mouse-input-lag-off': MousePointer2
}

const NOTES = {
  'safe-cleanup': 'Ação não reversível: arquivos apagados não podem ser recuperados.',
  'empty-recycle-bin': 'Ação não reversível: itens da lixeira são apagados permanentemente.',
  'clear-prefetch': 'Ação não reversível.',
  'windows-update-cache-clear': 'Ação não reversível.',
  'thumbcache-clear': 'Ação não reversível. As miniaturas são recriadas automaticamente com o tempo.',
  'dx-shader-cache-clear': 'Ação não reversível. Os jogos podem demorar um pouco mais para carregar na próxima execução.',
  'winsock-reset': 'Pode ser necessário reiniciar o computador para concluir.',
  'tcpip-reset': 'Pode ser necessário reiniciar o computador para concluir.',
  'sfc-scan': 'Pode levar vários minutos.',
  'dism-repair': 'Pode levar vários minutos.',
  'chkdsk-schedule': 'Será executado na próxima reinicialização do Windows.',
  'ultimate-performance': 'Disponível apenas em algumas versões do Windows.',
  'memory-usage-performance': 'Ajusta o gerenciamento de memória do NTFS para priorizar desempenho em vez de economia de RAM.',
  'platform-tick-on': 'Requer reinicialização do Windows para ter efeito.',
  'disable-dynamictick-on': 'Requer reinicialização do Windows para ter efeito. Reduz microtravamentos (stutters) em jogos.',
  'standby-list-clear': 'Ação pontual: libera memória em espera na hora, sem alterar configurações persistentes.',
  'restore-essential-services': 'Segura: só reativa serviços essenciais que estejam parados ou desativados, sem alterar mais nada.'
}

const TABS = [
  { key: 'sistema', label: 'Windows', categories: ['jogos', 'interface', 'limpeza', 'windows'] },
  { key: 'energia', label: 'Energia', categories: ['energia'] },
  { key: 'armazenamento', label: 'Armazenamento', categories: ['armazenamento'] },
  { key: 'mouse-teclado', label: 'Mouse & Teclado', categories: ['mouse', 'teclado'] },
  { key: 'internet', label: 'Internet', categories: ['internet'] },
  { key: 'reparo', label: 'Reparo', categories: ['reparo'] }
]

export default function Optimizations() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('sistema')
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkDone, setBulkDone] = useState(false)
  const cardRefs = useRef({})
  const bulkDoneTimeout = useRef(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: a } = await supabase.from('actions').select('*').eq('enabled', true).is('game', null).order('created_at')
      setActions(a || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => () => clearTimeout(bulkDoneTimeout.current), [])

  const actionsByTab = useMemo(() => {
    const map = Object.fromEntries(TABS.map((t) => [t.key, []]))
    for (const action of actions) {
      const tab = TABS.find((t) => t.categories.includes(action.category))
      if (tab) map[tab.key].push(action)
    }
    return map
  }, [actions])

  const currentActions = actionsByTab[activeTab] || []

  async function runAll() {
    clearTimeout(bulkDoneTimeout.current)
    setBulkRunning(true)
    setBulkDone(false)
    for (const action of currentActions) {
      const card = cardRefs.current[action.id]
      if (card?.run) {
        try {
          await card.run()
        } catch {
          // segue para a próxima otimização mesmo se uma falhar
        }
      }
    }
    setBulkRunning(false)
    setBulkDone(true)
    bulkDoneTimeout.current = setTimeout(() => setBulkDone(false), 4000)
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>OTIMIZAÇÕES</small>
          <h1>Otimizações do sistema</h1>
          <p>Execute ajustes seguros de desempenho, energia, rede e manutenção do Windows.</p>
        </div>
      </header>

      <nav className="opt-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`opt-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { clearTimeout(bulkDoneTimeout.current); setActiveTab(tab.key); setBulkDone(false) }}
          >
            {tab.label}
            {!loading && <span className="opt-tab-count">{(actionsByTab[tab.key] || []).length}</span>}
          </button>
        ))}
      </nav>

      {loading ? (
        <p>Carregando...</p>
      ) : currentActions.length === 0 ? (
        <p>Nenhuma otimização disponível nesta categoria ainda.</p>
      ) : (
        <>
          <div className="opt-bulk">
            <button className="opt-run opt-bulk-run" disabled={bulkRunning || currentActions.length === 0} onClick={runAll}>
              {bulkRunning ? (
                <><Loader2 size={14} className="opt-spin" /> Otimizando...</>
              ) : bulkDone ? (
                <><CheckCircle2 size={14} /> Otimizado com sucesso</>
              ) : (
                <><PlayCircle size={14} /> Otimizar tudo nesta aba</>
              )}
            </button>
            <small>Executa, uma por uma, todas as otimizações disponíveis para o seu plano nesta aba.</small>
          </div>
          <section className="metrics opt-grid">
            {currentActions.map((action) => (
              <OptimizationCard
                key={action.id}
                ref={(el) => { cardRefs.current[action.id] = el }}
                action={action}
                icon={ICONS[action.id]}
                note={NOTES[action.id]}
              />
            ))}
          </section>
        </>
      )}
    </motion.div>
  )
}
