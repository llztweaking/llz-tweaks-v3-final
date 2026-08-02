import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, SlidersHorizontal, Gamepad2, Activity, History, Settings, ShieldCheck, Info, PanelLeftClose, PanelLeftOpen, LogOut, MonitorCog, Mouse, ShieldAlert, CircuitBoard, HardDrive } from 'lucide-react'
import Brand from '../components/Brand'
import Background from '../components/Background'
import WindowControls from '../components/WindowControls'
import DiscordIcon from '../components/DiscordIcon'
import { openDiscordSupport } from '../lib/support'
import { ADMIN_DISCORD_HANDLES } from '../lib/team'
import { supabase } from '../services/supabase'
import { useLanguage } from '../lib/i18n/LanguageContext'

const REVALIDATE_INTERVAL_MS = 5 * 60 * 1000

function detectGpuVendor(gpuName) {
  const gpu = (gpuName || '').toLowerCase()
  if (gpu.includes('nvidia') || gpu.includes('geforce') || gpu.includes('rtx') || gpu.includes('gtx')) return 'nvidia'
  if (gpu.includes('amd') || gpu.includes('radeon')) return 'amd'
  return null
}

export default function AppLayout({ session, onLogout, onSessionUpdate }) {
  const { t } = useLanguage()
  const [c, setC] = useState(false)
  const [gpuVendor, setGpuVendor] = useState(null)
  const loc = useLocation()
  const initial = session?.discord?.replace('@', '').charAt(0).toUpperCase() || '?'
  const planLocked = session?.status === 'EXPIRED'
  const normalizedDiscord = (session?.discord || '').trim().toLowerCase()
  const isAdmin = ADMIN_DISCORD_HANDLES.includes(normalizedDiscord.startsWith('@') ? normalizedDiscord : `@${normalizedDiscord}`)

  useEffect(() => {
    let active = true
    window.llz?.system.summary().then((data) => {
      if (active) setGpuVendor(detectGpuVendor(data?.gpu))
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!session?.license) return
    window.llz?.session.register({ status: session.status || 'ACTIVE', expiresAt: session.expiresAt })
    return () => { window.llz?.session.clear() }
  }, [session?.license])

  useEffect(() => {
    if (!session?.license) return
    const interval = setInterval(async () => {
      const { data, error } = await supabase.rpc('check_license_status', { p_key: session.license })
      const result = data?.[0]
      if (error || !result?.status) return
      if (result.status !== session.status || result.expires_at !== session.expiresAt) {
        onSessionUpdate?.({ status: result.status, expiresAt: result.expires_at, plan: result.plan_name || session.plan })
      }
      window.llz?.session.register({ status: result.status, expiresAt: result.expires_at })
    }, REVALIDATE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [session?.license, session?.status, session?.expiresAt, session?.plan, onSessionUpdate])

  const nav = [
    ['/dashboard', t('nav.dashboard'), LayoutDashboard],
    ['/optimizations', t('nav.optimizations'), SlidersHorizontal],
    ['/games', t('nav.games'), Gamepad2],
    ['/precision', t('nav.precision'), Mouse],
    ...(gpuVendor === 'nvidia' ? [['/nvidia', t('nav.nvidia'), MonitorCog]] : []),
    ...(gpuVendor === 'amd' ? [['/amd', t('nav.amd'), MonitorCog]] : []),
    ['/diagnostics', t('nav.diagnostics'), Activity],
    ['/motherboard', t('nav.motherboard'), CircuitBoard],
    ['/drivers', t('nav.drivers'), HardDrive],
    ['/history', t('nav.history'), History],
    ['/settings', t('nav.settings'), Settings],
    ...(isAdmin ? [['/admin', t('nav.admin'), ShieldCheck]] : []),
    ['/about', t('nav.about'), Info]
  ]

  return (
    <div className="shell">
      <Background />
      <header className="titlebar">
        <div><Brand compact /><span>{nav.find((x) => x[0] === loc.pathname)?.[1] || 'LLZ Tweaks'}</span></div>
        <small>LLZ Tweaks 3.0.0</small>
        <WindowControls />
      </header>
      <div className="body">
        <aside className={c ? 'sidebar collapsed' : 'sidebar'}>
          <div className="side-top">
            <Brand compact={c} />
            <button onClick={() => setC(!c)}>{c ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}</button>
          </div>
          <nav>
            {nav.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} title={c ? label : ''} className={({ isActive }) => (isActive ? 'active' : '')}>
                <i />
                <Icon size={18} />
                {!c && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="user">
            {session?.avatarUrl ? <img src={session.avatarUrl} alt="" /> : <b>{initial}</b>}
            {!c && (
              <div>
                <strong>{session?.discord || t('nav.guest')}</strong>
                <span>{session?.plan || ''}</span>
              </div>
            )}
            {!c && (
              <button className="logout-icon" title={t('nav.logout')} onClick={onLogout}>
                <LogOut size={15} />
              </button>
            )}
          </div>
        </aside>
        <main className="content">
          <Outlet context={{ session }} />
          {planLocked && (
            <div className="plan-lock-overlay">
              <div className="plan-lock-card">
                <ShieldAlert size={30} />
                <h2>{t('nav.planLockTitle')}</h2>
                <p>{t('nav.planLockBody')}</p>
                <button type="button" className="discord-support-btn" onClick={openDiscordSupport}>
                  <span>{t('nav.planLockButton')}</span>
                  <DiscordIcon height={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
