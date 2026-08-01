import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Cog } from 'lucide-react'
import HoloMouse from '../components/HoloMouse'

export default function Precision() {
  const [glitching, setGlitching] = useState(true)

  useEffect(() => {
    const settle = setTimeout(() => setGlitching(false), 500)
    return () => clearTimeout(settle)
  }, [])

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>LLZ PRECISION</small>
          <h1>LLZ Precision</h1>
          <p>Um novo painel dedicado à precisão do seu mouse está a caminho.</p>
        </div>
      </header>

      <div className="precision-page">
        <HoloMouse />
        <div className="precision-soon">
          <p className={'glitch-text' + (glitching ? ' glitching' : '')} data-text="coming soon..">
            coming soon..
          </p>
          <Cog size={20} className="precision-gear" />
        </div>
      </div>
    </motion.div>
  )
}
