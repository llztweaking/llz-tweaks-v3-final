import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RotateCcw, Trash2, Gauge, Loader2,
  Gamepad2, RefreshCw, MousePointer2, Keyboard, Sparkles, Zap, Wifi, Network,
  HardDrive, Layers, Download, Image as ImageIcon, ShieldCheck, Wrench, MemoryStick, Clock, Timer,
  Rocket, Eraser, PlayCircle, CheckCircle2, Terminal, XCircle
} from 'lucide-react'
import { supabase } from '../services/supabase'
import OptimizationCard from '../components/OptimizationCard'
import { useLanguage } from '../lib/i18n/LanguageContext'

const ESSENTIAL_SERVICES_ID = 'restore-essential-services'

function VerifyServicesCard({ t }) {
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')

  async function open() {
    setStatus('running')
    try {
      const result = await window.llz?.services.verifyEssential()
      setStatus('done')
      setOutput(result || t('optimizations.verifyServicesOpened'))
    } catch (err) {
      setStatus('error')
      setOutput(err.message || t('optimizations.verifyServicesFailed'))
    }
  }

  return (
    <article className="card metric opt-card warning">
      <Terminal size={20} />
      <span>{t('optimizations.verifyServicesTitle')}</span>
      <small>{t('optimizations.verifyServicesDesc')}</small>

      <button className="opt-run" disabled={status === 'running'} onClick={open}>
        {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : t('optimizations.verifyServicesButton')}
      </button>

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

export default function Optimizations() {
  const { t } = useLanguage()
  const TABS = [
    { key: 'sistema', label: t('optimizations.tabWindows'), categories: ['jogos', 'interface', 'limpeza', 'windows'] },
    { key: 'energia', label: t('optimizations.tabEnergy'), categories: ['energia'] },
    { key: 'armazenamento', label: t('optimizations.tabStorage'), categories: ['armazenamento'] },
    { key: 'mouse-teclado', label: t('optimizations.tabMouseKeyboard'), categories: ['mouse', 'teclado'] },
    { key: 'internet', label: t('optimizations.tabInternet'), categories: ['internet'] },
    { key: 'reparo', label: t('optimizations.tabRepair'), categories: ['reparo'] },
    { key: 'servicos-essenciais', label: t('optimizations.tabEssentialServices'), categories: [] }
  ]
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
      if (action.id === ESSENTIAL_SERVICES_ID) {
        map['servicos-essenciais']?.push(action)
        continue
      }
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
          <small>{t('optimizations.eyebrow')}</small>
          <h1>{t('optimizations.title')}</h1>
          <p>{t('optimizations.subtitle')}</p>
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
        <p>{t('common.loading')}</p>
      ) : currentActions.length === 0 ? (
        <p>{t('optimizations.noneInCategory')}</p>
      ) : activeTab === 'servicos-essenciais' ? (
        <>
          <div className="section-heading essential-services-heading">
            <h3>{t('optimizations.essentialServicesSectionTitle')}</h3>
          </div>
          <section className="metrics opt-grid">
            {currentActions.map((action) => (
              <OptimizationCard
                key={action.id}
                ref={(el) => { cardRefs.current[action.id] = el }}
                action={action}
                icon={ICONS[action.id]}
                variant="warning"
                confirmMessage={t('optimizations.confirmRestoreServicesBody')}
              />
            ))}
            <VerifyServicesCard t={t} />
          </section>
        </>
      ) : (
        <>
          <div className="opt-bulk">
            <button className="opt-run opt-bulk-run" disabled={bulkRunning || currentActions.length === 0} onClick={runAll}>
              {bulkRunning ? (
                <><Loader2 size={14} className="opt-spin" /> {t('optimizations.runningAll')}</>
              ) : bulkDone ? (
                <><CheckCircle2 size={14} /> {t('optimizations.allDone')}</>
              ) : (
                <><PlayCircle size={14} /> {t('optimizations.runAllTab')}</>
              )}
            </button>
            <small>{t('optimizations.runAllHint')}</small>
          </div>
          <section className="metrics opt-grid">
            {currentActions.map((action) => (
              <OptimizationCard
                key={action.id}
                ref={(el) => { cardRefs.current[action.id] = el }}
                action={action}
                icon={ICONS[action.id]}
              />
            ))}
          </section>
        </>
      )}
    </motion.div>
  )
}
