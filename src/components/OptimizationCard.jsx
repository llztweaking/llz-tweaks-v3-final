import { forwardRef, useImperativeHandle, useState } from 'react'
import { Loader2, CheckCircle2, XCircle, Undo2, SlidersHorizontal, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'
import { addHistoryEntry } from '../lib/history'
import { supabase } from '../services/supabase'
import { getAppliedMap, isRevertible, setAppliedState } from '../lib/optimizationState'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { actionName, actionDescription, actionNote } from '../lib/i18n/dynamicText'

async function logExecution(t, action, result, startedAt) {
  addHistoryEntry(`${actionName(t, action)} ${result === 'reverted' ? t('common.historyReverted') : t('common.historyApplied')}`)
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

const OptimizationCard = forwardRef(function OptimizationCard({ action, icon: Icon, variant, confirmMessage }, ref) {
  const { t } = useLanguage()
  const IconComponent = Icon || SlidersHorizontal
  const revertible = isRevertible(action.id)
  const note = actionNote(t, action.id)
  const [status, setStatus] = useState('idle')
  const [output, setOutput] = useState('')
  const [applied, setApplied] = useState(() => Boolean(getAppliedMap()[action.id]))
  const [confirming, setConfirming] = useState(false)

  async function execute() {
    setStatus('running')
    const startedAt = Date.now()
    try {
      await window.llz?.optimizations.run(action.id)
      setStatus('done')
      setOutput(t('common.optimizedSuccess'))
      if (revertible) {
        setAppliedState(action.id, true)
        setApplied(true)
      }
      await logExecution(t, action, 'success', startedAt)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || t('common.runFailed'))
    }
  }

  function run() {
    if (confirmMessage) {
      setConfirming(true)
      return
    }
    return execute()
  }

  useImperativeHandle(ref, () => ({ run: execute }))

  async function revert() {
    setStatus('reverting')
    const startedAt = Date.now()
    try {
      await window.llz?.optimizations.revert(action.id)
      setStatus('idle')
      setOutput('')
      setAppliedState(action.id, false)
      setApplied(false)
      await logExecution(t, action, 'reverted', startedAt)
    } catch (err) {
      setStatus('error')
      setOutput(err.message || t('common.removeFailed'))
    }
  }

  return (
    <>
    <article className={`card metric opt-card${variant ? ` ${variant}` : ''}`}>
      <IconComponent size={20} />
      <span>{actionName(t, action)}</span>
      <small>{actionDescription(t, action)}</small>

      {applied ? (
        <>
          <div className="opt-badge">{t('common.optimizedBadge')}</div>
          {revertible && (
            <button className="opt-run opt-remove" disabled={status === 'reverting'} onClick={revert}>
              {status === 'reverting' ? <Loader2 size={14} className="opt-spin" /> : <><Undo2 size={13} /> {t('common.remove')}</>}
            </button>
          )}
        </>
      ) : (
        <button className="opt-run" disabled={status === 'running'} onClick={run}>
          {status === 'running' ? <Loader2 size={14} className="opt-spin" /> : t('common.run')}
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
      {action.requires_admin && <small className="opt-note">{t('common.adminRequired')}</small>}
      {note && <small className="opt-note">{note}</small>}
    </article>

    {confirming && (
      <div className="modal-backdrop" onClick={() => setConfirming(false)}>
        <motion.section
          className="card modal-card confirm-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="confirm-icon warning">
            <ShieldAlert size={22} />
          </div>
          <h3>{t('optimizations.confirmRestoreServicesTitle')}</h3>
          <p className="confirm-note">{confirmMessage}</p>
          <div className="confirm-actions">
            <button className="opt-run" onClick={() => setConfirming(false)}>{t('games.cancel')}</button>
            <button className="login-submit confirm-submit warning" onClick={() => { setConfirming(false); execute() }}>
              {t('optimizations.confirmProceed')}
            </button>
          </div>
        </motion.section>
      </div>
    )}
    </>
  )
})

export default OptimizationCard
