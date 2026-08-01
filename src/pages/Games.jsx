import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, ShieldAlert, Undo2 } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'
import { supabase } from '../services/supabase'
import { getAppliedMap, setAppliedState } from '../lib/optimizationState'
import cs2Cover from '../assets/games/cs2.jpg'
import valorantCover from '../assets/games/valorant.jpg'
import fortniteCover from '../assets/games/fortnite.jpg'
import fivemCover from '../assets/games/fivem.jpg'

const COVERS = {
  cs2: cs2Cover,
  valorant: valorantCover,
  fortnite: fortniteCover,
  fivem: fivemCover
}

function ConfirmModal({ action, onCancel, onConfirm, loading }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <motion.section
        className="card modal-card confirm-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="confirm-icon">
          <ShieldAlert size={22} />
        </div>
        <h3>Confirmar aplicação de otimizações</h3>
        <p>
          Você está prestes a aplicar ajustes de sistema específicos para <strong>{action.name}</strong>:
          prioridade de processo, preferência de GPU dedicada e desativação de otimizações de tela cheia.
          As alterações afetam apenas o executável deste jogo e podem ser revertidas a qualquer momento
          pelo botão "Remover otimização".
        </p>
        <p className="confirm-note">Deseja confirmar a aplicação?</p>
        <div className="confirm-actions">
          <button className="opt-run" onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className="login-submit confirm-submit" onClick={onConfirm} disabled={loading}>
            {loading ? 'Aplicando...' : 'Confirmar e aplicar'}
          </button>
        </div>
      </motion.section>
    </div>
  )
}

async function logExecution(action, result, startedAt) {
  addHistoryEntry(`${action.name} ${result === 'reverted' ? 'revertido' : 'otimizado'}`)
  const { data: { session: authSession } } = await supabase.auth.getSession()
  if (authSession) {
    await supabase.from('execution_logs').insert({
      user_id: authSession.user.id,
      action_id: action.id,
      result,
      duration_ms: Date.now() - startedAt
    })
  }
}

function GameCard({ action, onRequestApply }) {
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')
  const [applied, setApplied] = useState(() => Boolean(getAppliedMap()[action.id]))

  async function revert() {
    setStatus('reverting')
    const startedAt = Date.now()
    try {
      const result = await window.llz?.optimizations.revert(action.id)
      setStatus('idle')
      setOutput('')
      setAppliedState(action.id, false)
      setApplied(false)
      await logExecution(action, 'reverted', startedAt)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || 'Falha ao remover otimização.')
    }
  }

  return (
    <article className="card game-card">
      <div className="game-cover">
        <img src={COVERS[action.game]} alt={action.name} />
      </div>
      <div className="game-card-body">
        <span>{action.name}</span>
        <small>{action.description}</small>

        {applied ? (
          <>
            <div className="opt-badge">OTIMIZADO</div>
            <button className="opt-run opt-remove" disabled={status === 'reverting'} onClick={revert}>
              {status === 'reverting' ? <Loader2 size={14} className="opt-spin" /> : <><Undo2 size={13} /> Remover otimização</>}
            </button>
          </>
        ) : (
          <button
            className="opt-run"
            disabled={status === 'running'}
            onClick={() => onRequestApply(action, { setStatus, setOutput, setApplied })}
          >
            {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : 'Otimizar'}
          </button>
        )}

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
        {action.requires_admin && <small className="opt-note">Requer permissão de administrador (UAC).</small>}
      </div>
    </article>
  )
}

export default function Games() {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: a } = await supabase.from('actions').select('*').eq('enabled', true).not('game', 'is', null).order('name')
      setActions(a || [])
      setLoading(false)
    }
    load()
  }, [])

  function requestApply(action, setters) {
    setPending({ action, setters })
  }

  async function confirmApply() {
    if (!pending) return
    const { action, setters } = pending
    setApplying(true)
    setters.setStatus('running')
    const startedAt = Date.now()
    try {
      const output = await window.llz?.optimizations.run(action.id)
      setters.setStatus('done')
      setters.setOutput(output || 'Concluído.')
      setAppliedState(action.id, true)
      setters.setApplied(true)
      await logExecution(action, 'success', startedAt)
    } catch (err) {
      setters.setStatus('error')
      setters.setOutput(err.message || 'Falha ao executar.')
    } finally {
      setApplying(false)
      setPending(null)
    }
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>JOGOS</small>
          <h1>Otimização por jogo</h1>
          <p>Ajustes específicos de GPU, prioridade e tela cheia para cada título.</p>
        </div>
      </header>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <section className="game-grid">
          {actions.map((action) => (
            <GameCard
              key={action.id}
              action={action}
              onRequestApply={requestApply}
            />
          ))}
        </section>
      )}

      {pending && (
        <ConfirmModal
          action={pending.action}
          loading={applying}
          onCancel={() => !applying && setPending(null)}
          onConfirm={confirmApply}
        />
      )}
    </motion.div>
  )
}
