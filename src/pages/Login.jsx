import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, CheckCircle2, UserPlus, Loader2 } from 'lucide-react'
import Brand from '../components/Brand'
import Background from '../components/Background'
import WindowControls from '../components/WindowControls'
import HoloGlobe from '../components/HoloGlobe'
import GlitchPhrases from '../components/GlitchPhrases'
import DiscordIcon from '../components/DiscordIcon'
import { supabase } from '../services/supabase'
import { openDiscordSupport } from '../lib/support'
import { getConnectedDiscord, setConnectedDiscord, clearConnectedDiscord, extractDiscordIdentity } from '../lib/discordAccount'
import { useLanguage } from '../lib/i18n/LanguageContext'

export default function Login({ onLogin, onRegisterClick }) {
  const { t } = useLanguage()
  const [license, setLicense] = useState('')
  const [connectedAccount, setConnectedAccount] = useState(() => getConnectedDiscord())
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // A conta salva localmente é só um atalho visual pra não piscar a tela ao abrir o app —
  // quem manda de verdade é a sessão do Supabase, então confirma (ou corrige) assim que carrega.
  useEffect(() => {
    let active = true
    async function syncSession() {
      if (!supabase) return
      const { data } = await supabase.auth.getSession()
      if (!active) return
      const identity = extractDiscordIdentity(data.session?.user)
      if (identity) {
        setConnectedAccount(identity)
        setConnectedDiscord(identity)
      } else if (getConnectedDiscord()) {
        clearConnectedDiscord()
        setConnectedAccount(null)
      }
    }
    syncSession()
    return () => { active = false }
  }, [])

  async function forgetAccount() {
    clearConnectedDiscord()
    setConnectedAccount(null)
    await supabase?.auth.signOut()
  }

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

      setConnectedAccount(identity)
      setConnectedDiscord(identity)
    } catch (err) {
      setError(err.message || t('register.errConnectFailed'))
    } finally {
      setConnecting(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!license.trim() || !connectedAccount) {
      setError(t('login.errFillFields'))
      return
    }
    if (!supabase) {
      setError(t('login.errServiceUnavailable'))
      return
    }

    setLoading(true)
    setError('')

    const hwid = (await window.llz?.system.hwid()) || null
    const { data, error: rpcError } = await supabase.rpc('login_with_linked_discord', {
      p_key: license.trim(),
      p_hwid: hwid
    })

    setLoading(false)

    if (rpcError) {
      setError(t('login.errValidate'))
      return
    }

    const result = data?.[0]
    if (!result?.ok) {
      setError(result?.message || t('login.errInvalidLicense'))
      return
    }

    onLogin({ license: license.trim().toUpperCase(), discord: connectedAccount.username, avatarUrl: connectedAccount.avatarUrl || null, plan: result.plan_name, expiresAt: result.expires_at, status: result.status })
  }

  return (
    <div className="shell">
      <Background />
      <header className="titlebar">
        <div><Brand compact /><span>{t('login.titlebarLabel')}</span></div>
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
              <small>{t('login.eyebrow')}</small>
              <h1>{t('login.title')}</h1>
              <p>{t('login.subtitle')}</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <label>
                <span>{t('login.licenseLabel')}</span>
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder={t('login.licensePlaceholder')}
                  autoComplete="off"
                  spellCheck="false"
                />
              </label>

              <label>
                <span>{t('login.discordLabel')}</span>
                {connectedAccount ? (
                  <div className="discord-connected">
                    {connectedAccount.avatarUrl ? (
                      <img className="discord-avatar" src={connectedAccount.avatarUrl} alt="" />
                    ) : (
                      <div className="discord-avatar">{connectedAccount.avatarInitial}</div>
                    )}
                    <div className="discord-connected-info">
                      <strong>{connectedAccount.username}</strong>
                      <span><CheckCircle2 size={11} /> {t('login.connected')}</span>
                    </div>
                    <button type="button" className="discord-swap-btn" onClick={forgetAccount}>
                      {t('login.swap')}
                    </button>
                  </div>
                ) : (
                  <button type="button" className="discord-connect-btn" onClick={connectDiscord} disabled={connecting}>
                    {connecting ? <Loader2 size={14} className="opt-spin" /> : <DiscordIcon height={14} />}
                    {connecting ? t('register.waitingDiscord') : t('register.connectButton')}
                  </button>
                )}
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading || !connectedAccount}>
                {loading ? t('login.submitting') : <>{t('login.submit')} <ArrowRight size={16} /></>}
              </button>
            </form>

            {!connectedAccount && (
              <motion.button
                type="button"
                className="register-link-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onRegisterClick}
              >
                <UserPlus size={14} /> {t('login.registerLink')}
              </motion.button>
            )}

            <button type="button" className="discord-support-btn" onClick={openDiscordSupport}>
              <span>{t('login.supportButton')}</span>
              <DiscordIcon height={16} />
            </button>

            <div className="login-foot">
              <ShieldCheck size={13} />
              <span>{t('login.footNote')}</span>
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
