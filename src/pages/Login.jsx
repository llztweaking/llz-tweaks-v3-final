import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react'
import Brand from '../components/Brand'
import Background from '../components/Background'
import WindowControls from '../components/WindowControls'
import HoloGlobe from '../components/HoloGlobe'
import GlitchPhrases from '../components/GlitchPhrases'
import DiscordIcon from '../components/DiscordIcon'
import { supabase } from '../services/supabase'
import { openDiscordSupport } from '../lib/support'
import { getConnectedDiscord, setConnectedDiscord, clearConnectedDiscord, extractDiscordIdentity } from '../lib/discordAccount'

export default function Login({ onLogin, onRegisterClick }) {
  const [license, setLicense] = useState('')
  const [discord, setDiscord] = useState('')
  const [connectedAccount, setConnectedAccount] = useState(() => getConnectedDiscord())
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

  async function submit(event) {
    event.preventDefault()
    if (!license.trim() || (!connectedAccount && !discord.trim())) {
      setError('Preencha a licença e o usuário do Discord.')
      return
    }
    if (!supabase) {
      setError('Serviço de licenças indisponível. Tente novamente mais tarde.')
      return
    }

    setLoading(true)
    setError('')

    if (connectedAccount) {
      const hwid = (await window.llz?.system.hwid()) || null
      const { data, error: rpcError } = await supabase.rpc('login_with_linked_discord', {
        p_key: license.trim(),
        p_hwid: hwid
      })

      setLoading(false)

      if (rpcError) {
        setError('Erro ao validar licença. Tente novamente.')
        return
      }

      const result = data?.[0]
      if (!result?.ok) {
        setError(result?.message || 'Licença inválida ou não encontrada.')
        return
      }

      onLogin({ license: license.trim().toUpperCase(), discord: connectedAccount.username, avatarUrl: connectedAccount.avatarUrl || null, plan: result.plan_name, expiresAt: result.expires_at, status: result.status })
      return
    }

    const discordValue = discord.trim()
    let { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError) {
        setLoading(false)
        setError('Não foi possível iniciar a sessão. Tente novamente.')
        return
      }
      sessionData = { session: anonData.session }
    }

    const hwid = (await window.llz?.system.hwid()) || null
    const { data, error: rpcError } = await supabase.rpc('redeem_or_login_license', {
      p_key: license.trim(),
      p_discord: discordValue,
      p_hwid: hwid,
      p_user_id: sessionData.session.user.id
    })

    setLoading(false)

    if (rpcError) {
      setError('Erro ao validar licença. Tente novamente.')
      return
    }

    const result = data?.[0]
    if (!result?.ok) {
      setError(result?.message || 'Licença inválida ou não encontrada.')
      return
    }

    onLogin({ license: license.trim().toUpperCase(), discord: discordValue, plan: result.plan_name, expiresAt: result.expires_at, status: result.status })
  }

  return (
    <div className="shell">
      <Background />
      <header className="titlebar">
        <div><Brand compact /><span>Acesso</span></div>
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
              <small>ACESSO RESTRITO</small>
              <h1>Entre na sua conta</h1>
              <p>Use sua licença e seu usuário do Discord para acessar a Performance Suite.</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <label>
                <span>Licença</span>
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="LLZ-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck="false"
                />
              </label>

              <label>
                <span>Discord</span>
                {connectedAccount ? (
                  <div className="discord-connected">
                    {connectedAccount.avatarUrl ? (
                      <img className="discord-avatar" src={connectedAccount.avatarUrl} alt="" />
                    ) : (
                      <div className="discord-avatar">{connectedAccount.avatarInitial}</div>
                    )}
                    <div className="discord-connected-info">
                      <strong>{connectedAccount.username}</strong>
                      <span><CheckCircle2 size={11} /> Conectado</span>
                    </div>
                    <button type="button" className="discord-swap-btn" onClick={forgetAccount}>
                      Trocar
                    </button>
                  </div>
                ) : (
                  <input
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    placeholder="@seuusuario"
                    autoComplete="off"
                    spellCheck="false"
                  />
                )}
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Entrando...' : <>Entrar <ArrowRight size={16} /></>}
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
                <UserPlus size={14} /> Cadastre-se aqui
              </motion.button>
            )}

            <button type="button" className="discord-support-btn" onClick={openDiscordSupport}>
              <span>Precisa de suporte?</span>
              <DiscordIcon height={16} />
            </button>

            <div className="login-foot">
              <ShieldCheck size={13} />
              <span>Licença validada em tempo real pelo servidor.</span>
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
