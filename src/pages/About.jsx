import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import Brand from '../components/Brand'
import DiscordIcon from '../components/DiscordIcon'
import { TEAM } from '../lib/team'

export default function About() {
  const navigate = useNavigate()

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>PROJETO</small>
          <h1>Sobre o LLZ Tweaks</h1>
          <p>Performance Suite para Windows e jogos competitivos.</p>
        </div>
      </header>

      <section className="card about">
        <Brand />
        <p>
          O LLZ Tweaks otimiza seu sistema e seus jogos competitivos (CS2, Valorant, Fortnite, FiveM) em poucos
          cliques, com diagnóstico real do seu hardware e licenciamento seguro — tudo em um único painel.
        </p>

        <div className="credits">
          {TEAM.map((person) => (
            <div className="credit-person" key={person.name}>
              <div className="emblem-scene">
                <div className="emblem-glow" />
                <div className="emblem-ring" />
                <div className="emblem-spin">
                  <Crown size={22} />
                </div>
              </div>
              <strong>{person.name}</strong>
              <span className="credit-role">{person.role}</span>
              <span className="credit-discord"><DiscordIcon height={12} />{person.discord}</span>
            </div>
          ))}
        </div>

        <button className="link-button" onClick={() => navigate('/terms')}>Termos de Uso</button>
      </section>
    </motion.div>
  )
}
