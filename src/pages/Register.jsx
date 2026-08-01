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

export default function Register({ onBack, onRegistered }) {
  const [license, setLicense] = useState('')
  const [discordUser, setDiscordUser] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function connectDiscord() {
    if (!supabase) {
      setError('Serviço de contas indisponível. Tente novamente mais tarde.')
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
      if (oauthError || !data?.url) throw new Error('Não foi possível iniciar a conexão com o Discord.')

      await window.llz.system.openExternal(data.url)
      const tokens = await window.llz.auth.discordWait()

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      })
      if (sessionError) throw sessionError

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) throw new Error('Não foi possível confirmar a conta do Discord.')

      const identity = extractDiscordIdentity(userData.user)
      if (!identity) throw new Error('Conta conectada não tem um Discord vinculado.')

      setDiscordUser(identity)
    } catch (err) {
      setError(err.message || 'Não foi possível conectar ao Discord.')
    } finally {
      setConnecting(false)
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!discordUser) {
      setError('Conecte a conta do Discord que você usou na compra.')
      return
    }
    if (!license.trim()) {
      setError('Digite a key que foi enviada a você.')
      return
    }
    if (!supabase) {
      setError('Serviço de licenças indisponível. Tente novamente mais tarde.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error: rpcError } = await supabase.rpc('link_license_discord', { p_key: license.trim() })

    setLoading(false)

    if (rpcError) {
      setError('Erro ao vincular a key. Tente novamente.')
      return
    }

    const result = data?.[0]
    if (!result?.ok) {
      setError(result?.message || 'Não foi possível vincular a key.')
      return
    }

    setConnectedDiscord(discordUser)
    onRegistered?.()
  }

  return (
    <div className="shell">
      <Background />
      <header className="titlebar">
        <div><Brand compact /><span>Cadastro</span></div>
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
              <small>CADASTRO</small>
              <h1>Vincule sua conta</h1>
              <p>Conecte a conta do Discord que você usou na compra e registre a key que foi enviada a você.</p>
            </div>

            <form className="login-form" onSubmit={submit}>
              <label>
                <span>Discord</span>
                {discordUser ? (
                  <div className="discord-connected">
                    {discordUser.avatarUrl ? (
                      <img className="discord-avatar" src={discordUser.avatarUrl} alt="" />
                    ) : (
                      <div className="discord-avatar">{discordUser.avatarInitial}</div>
                    )}
                    <div className="discord-connected-info">
                      <strong>{discordUser.username}</strong>
                      <span><CheckCircle2 size={11} /> Conectado</span>
                    </div>
                    <button type="button" className="discord-swap-btn" onClick={() => setDiscordUser(null)}>
                      Trocar
                    </button>
                  </div>
                ) : (
                  <button type="button" className="discord-connect-btn" onClick={connectDiscord} disabled={connecting}>
                    {connecting ? <Loader2 size={14} className="opt-spin" /> : <DiscordIcon height={14} />}
                    {connecting ? 'Aguardando o Discord...' : 'Conectar com Discord'}
                  </button>
                )}
              </label>

              <label>
                <span>Key da compra</span>
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="LLZ-XXXX-XXXX"
                  autoComplete="off"
                  spellCheck="false"
                />
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Cadastrando...' : <>Concluir cadastro <ArrowRight size={16} /></>}
              </button>
            </form>

            <motion.button
              type="button"
              className="back-link-btn"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
            >
              <ArrowLeft size={14} /> Voltar para o login
            </motion.button>

            <div className="login-foot">
              <ShieldCheck size={13} />
              <span>A key só pode ser vinculada a uma conta do Discord.</span>
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
