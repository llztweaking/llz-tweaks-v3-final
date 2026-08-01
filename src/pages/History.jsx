import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { getHistory, clearHistory } from '../lib/history'

export default function History() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  function handleClear() {
    clearHistory()
    setHistory([])
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>HISTÓRICO</small>
          <h1>Histórico de ações</h1>
          <p>Todas as otimizações e diagnósticos que você executou nesta instalação.</p>
        </div>
        {history.length > 0 && (
          <button className="opt-run" onClick={handleClear}>
            <Trash2 size={14} /> Limpar histórico
          </button>
        )}
      </header>

      <section className="card">
        {history.length ? (
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {h.label}
                <small>{new Date(h.at).toLocaleString('pt-BR')}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <h2>Nenhuma ação ainda</h2>
            <p>Rode uma otimização ou um diagnóstico para começar a construir seu histórico.</p>
          </div>
        )}
      </section>
    </motion.div>
  )
}
