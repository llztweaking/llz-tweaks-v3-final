import { forwardRef, useImperativeHandle, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Undo2, SlidersHorizontal } from 'lucide-react'
import { addHistoryEntry } from '../lib/history'
import { supabase } from '../services/supabase'
import { getAppliedMap, isRevertible, setAppliedState } from '../lib/optimizationState'

async function logExecution(action, result, startedAt) {
  addHistoryEntry(`${action.name} ${result === 'reverted' ? 'revertido' : 'aplicado'}`)
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

const OptimizationCard = forwardRef(function OptimizationCard({ action, icon: Icon, note }, ref) {
  const IconComponent = Icon || SlidersHorizontal
  const revertible = isRevertible(action.id)
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')
  const [applied, setApplied] = useState(() => Boolean(getAppliedMap()[action.id]))

  async function run() {
    setStatus('running')
    const startedAt = Date.now()
    try {
      await window.llz?.optimizations.run(action.id)
      setStatus('done')
      setOutput('Otimizado com sucesso.')
      if (revertible) {
        setAppliedState(action.id, true)
        setApplied(true)
      }
      await logExecution(action, 'success', startedAt)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || 'Falha ao executar.')
    }
  }

  useImperativeHandle(ref, () => ({ run }))

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
    <article className="card metric opt-card">
      <IconComponent size={20} />
      <span>{action.name}</span>
      <small>{action.description}</small>

      {applied ? (
        <>
          <div className="opt-badge">OTIMIZADO</div>
          {revertible && (
            <button className="opt-run opt-remove" disabled={status === 'reverting'} onClick={revert}>
              {status === 'reverting' ? <Loader2 size={14} className="opt-spin" /> : <><Undo2 size={13} /> Remover otimização</>}
            </button>
          )}
        </>
      ) : (
        <button className="opt-run" disabled={status === 'running'} onClick={run}>
          {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : 'Executar'}
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
      {note && <small className="opt-note">{note}</small>}
    </article>
  )
})

export default OptimizationCard
