import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand'
import Background from '../components/Background'
import WindowControls from '../components/WindowControls'
import HoloGlobe from '../components/HoloGlobe'
import GlitchPhrases from '../components/GlitchPhrases'
import DiscordIcon from '../components/DiscordIcon'
import { supabase } from '../services/supabase'
import { setConnectedDiscord, extractDiscordIdentity } from '../lib/discordAccount'
import { useLanguage } from '../lib/i18n/LanguageContext'

export default function Register({ onBack, onRegistered }) {
  const { t } = useLanguage()
  const [license, setLicense] = useState('')
  const [discordUser, setDiscordUser] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function connectDiscord() {
    if (!supabase) {
      setError(t('register.errServiceUnavailable'))
      return
    }
    setError('')
    setConnecting(true)
    try {
      const { port } = await window.llz.auth.discordStart()
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: `http://127.0.0.1:${port}/callback`, skipBrowserRedirect: true }
      })
      if (oauthError || !data?.url) throw new Error(t('register.errOauthStart'))

      await window.llz.system.openExternal(data.url)
      const tokens = await window.llz.auth.discordWait()

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      })
      if (sessionError) throw sessionError

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) throw new Error(t('register.errConfirmDiscord'))

      const identity = extractDiscordIdentity(userData.user)
      if (!identity) throw new Error(t('register.errNoDiscordLinked'))

      setDiscordUser(identity)
    } catch (err) {
      setError(err.message || t('register.errConnectFailed'))
    } finally {
      setConnecting(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!discordUser) {
      setError(t('register.errNeedDiscordConnect'))
      return
    }
    if (!license.trim()) {
      setError(t('register.errNeedLicense'))
      return
    }
    if (!supabase) {
      setError(t('register.errLicenseServiceUnavailable'))
      return
    }

    setLoading(true)
    setError('')

    const { data, error: rpcError } = await supabase.rpc('link_license_discord', { p_key: license.trim() })

    setLoading(false)

    if (rpcError) {
      setError(t('register.errLinkFailed'))
      return
    }

    const result = data?.[0]
    if (!result?.ok) {
      setError(result?.message || t('register.errLinkFailedGeneric'))
      return
    }

    setConnectedDiscord(discordUser)
    onRegistered?.()
  }

  return (
    <div className="shell">
      <Background />
      <header className="titlebar">
        <div><Brand compact /><span>{t('register.titlebarLabel')}</span></div>
        <small>LLZ Tweaks 3.0.0</small>
        <WindowControls />
      </header>

      <main className="login-stage login-stage-split">
        <div className="login-left">
          <motion.section
            className="card login-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Brand />

            <div className="login-head">
              <small>{t('register.eyebrow')}</small>
              <h1>{t('register.title')}</h1>
              <p>{t('register.subtitle')}</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <label>
                <span>{t('register.discordLabel')}</span>
                {discordUser ? (
                  <div className="discord-connected">
                    {discordUser.avatarUrl ? (
                      <img className="discord-avatar" src={discordUser.avatarUrl} alt="" />
                    ) : (
                      <div className="discord-avatar">{discordUser.avatarInitial}</div>
                    )}
                    <div className="discord-connected-info">
                      <strong>{discordUser.username}</strong>
                      <span><CheckCircle2 size={11} /> {t('register.connected')}</span>
                    </div>
                    <button type="button" className="discord-swap-btn" onClick={() => setDiscordUser(null)}>
                      {t('register.swap')}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="discord-connect-btn" onClick={connectDiscord} disabled={connecting}>
                    {connecting ? <Loader2 size={14} className="opt-spin" /> : <DiscordIcon height={14} />}
                    {connecting ? t('register.waitingDiscord') : t('register.connectButton')}
                  </button>
                )}
              </label>

              <label>
                <span>{t('register.licenseLabel')}</span>
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder={t('register.licensePlaceholder')}
                  autoComplete="off"
                  spellCheck="false"
                />
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? t('register.submitting') : <>{t('register.submit')} <ArrowRight size={16} /></>}
              </button>
            </form>

            <motion.button
              type="button"
              className="back-link-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
            >
              <ArrowLeft size={14} /> {t('register.backButton')}
            </motion.button>

            <div className="login-foot">
              <ShieldCheck size={13} />
              <span>{t('register.footNote')}</span>
            </div>
          </motion.section>
        </div>

        <motion.div
          className="login-right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <HoloGlobe />
          <GlitchPhrases />
        </motion.div>
      </main>
    </div>
  )
}
