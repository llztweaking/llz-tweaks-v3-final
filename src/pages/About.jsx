import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import Brand from '../components/Brand'
import DiscordIcon from '../components/DiscordIcon'
import { TEAM } from '../lib/team'
import { useLanguage } from '../lib/i18n/LanguageContext'
import { teamRole } from '../lib/i18n/dynamicText'

export default function About() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>{t('about.eyebrow')}</small>
          <h1>{t('about.title')}</h1>
          <p>{t('about.subtitle')}</p>
        </div>
      </header>

      <section className="card about">
        <Brand />
        <p>{t('about.body')}</p>

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
              <span className="credit-role">{teamRole(t, person)}</span>
              <span className="credit-discord"><DiscordIcon height={12} />{person.discord}</span>
            </div>
          ))}
        </div>

        <button className="link-button" onClick={() => navigate('/terms')}>{t('settings.termsButton')}</button>
      </section>
    </motion.div>
  )
}
