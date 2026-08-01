import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, RefreshCw, DownloadCloud } from 'lucide-react'
import { clearHistory } from '../lib/history'

const UPDATE_LABELS = {
  'up-to-date': 'Você já está na versão mais recente.',
  available: 'Nova versão encontrada, baixando...',
  downloading: 'Baixando atualização...',
  ready: 'Atualização pronta para instalar.',
  error: 'Não foi possível verificar atualizações.'
}

export default function Settings() {
  const { session } = useOutletContext()
  const navigate = useNavigate()
  const [version, setVersion] = useState('')
  const [startup, setStartup] = useState(false)
  const [background, setBackground] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [update, setUpdate] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    window.llz?.app.version().then(setVersion)
    window.llz?.startup.get().then(setStartup)
    window.llz?.background.get().then(setBackground)
    const unsubscribe = window.llz?.updates.onStatus((data) => {
      setUpdate(data)
      setChecking(false)
    })
    return () => unsubscribe?.()
  }, [])

  async function checkForUpdates() {
    setChecking(true)
    setUpdate(null)
    const result = await window.llz?.updates.check()
    if (!result) setChecking(false)
  }

  async function toggleStartup() {
    const next = !startup
    const applied = await window.llz?.startup.set(next)
    setStartup(applied ?? next)
  }

  async function toggleBackground() {
    const next = !background
    const applied = await window.llz?.background.set(next)
    setBackground(applied ?? next)
  }

  function handleClearHistory() {
    clearHistory()
    setCleared(true)
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>CONFIGURAÇÕES</small>
          <h1>Configurações</h1>
          <p>Preferências do aplicativo e dados da sua conta.</p>
        </div>
      </header>

      <section className="card">
        <h3>Atualizações</h3>
        <div className="settings-row">
          <div>
            <strong>Versão instalada: {version || '—'}</strong>
            <span>{update ? UPDATE_LABELS[update.status] : 'Verificado automaticamente ao abrir o app.'}</span>
          </div>
          {update?.status === 'ready' ? (
            <button className="opt-run" onClick={() => window.llz?.updates.install()}>
              <DownloadCloud size={14} /> Reiniciar e instalar
            </button>
          ) : (
            <button className="opt-run" disabled={checking} onClick={checkForUpdates}>
              <RefreshCw size={14} className={checking ? 'opt-spin' : ''} /> {checking ? 'Verificando...' : 'Verificar agora'}
            </button>
          )}
        </div>
        {update?.status === 'downloading' && (
          <div className="opt-result ok">
            <span>{update.percent}% baixado</span>
          </div>
        )}
      </section>

      <section className="lower">
        <section className="card">
          <h3>Aplicativo</h3>
          <div className="settings-row">
            <div>
              <strong>Iniciar com o Windows</strong>
              <span>Abre o LLZ Tweaks automaticamente ao ligar o PC.</span>
            </div>
            <button className={startup ? 'toggle on' : 'toggle'} onClick={toggleStartup}>
              <i />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Rodar em segundo plano</strong>
              <span>Ao fechar a janela, o LLZ Tweaks continua rodando minimizado na bandeja do sistema.</span>
            </div>
            <button className={background ? 'toggle on' : 'toggle'} onClick={toggleBackground}>
              <i />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Limpar histórico</strong>
              <span>Remove o registro de ações salvo neste dispositivo.</span>
            </div>
            <button className="opt-run" onClick={handleClearHistory}>
              <Trash2 size={14} /> Limpar
            </button>
          </div>
          {cleared && (
            <div className="opt-result ok">
              <span>Histórico limpo.</span>
            </div>
          )}
        </section>

        <section className="card">
          <h3>Conta</h3>
          <div className="license">
            <div><span>Plano</span><strong>{session?.plan || '—'}</strong></div>
            <div><span>Discord</span><strong>{session?.discord || '—'}</strong></div>
            <div><span>Versão do app</span><strong>{version || '—'}</strong></div>
          </div>
          <button className="link-button" onClick={() => navigate('/terms')}>Termos de Uso</button>
        </section>
      </section>
    </motion.div>
  )
}
