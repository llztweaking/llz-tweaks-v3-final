import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, ShieldCheck, ShieldOff, RotateCcw, Plus, LogOut, Trash2, Ban } from 'lucide-react'
import { supabase } from '../services/supabase'

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const group = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `LLZ-${group()}-${group()}`
}

function AdminLoginForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError('E-mail ou senha inválidos, ou esta conta não é admin.')
      return
    }
    onSuccess()
  }

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>ADMIN</small>
          <h1>Acesso restrito</h1>
          <p>Entre com sua conta de administrador.</p>
        </div>
      </header>
      <section className="card admin-login-card">
        <form className="login-form" onSubmit={submit}>
          <label>
            <span>E-mail</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </label>
          <label>
            <span>Senha</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </motion.div>
  )
}

function UserDetailModal({ license, keyRow, plans, onClose, onChanged }) {
  const [sessions, setSessions] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(license.plan_id)
  const [expiresAt, setExpiresAt] = useState(license.expires_at ? license.expires_at.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: s }, { data: l }] = await Promise.all([
      supabase.from('client_sessions').select('*').eq('license_id', license.id).order('created_at', { ascending: false }),
      supabase.from('license_logs').select('*').eq('license_key', license.license_key).order('created_at', { ascending: false })
    ])
    setSessions(s || [])
    setLogs(l || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function update(fields) {
    setSaving(true)
    await supabase.from('licenses').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', license.id)
    setSaving(false)
    onChanged()
  }

  async function toggleStatus(target) {
    await update({ status: license.status === target ? 'ACTIVE' : target })
  }

  async function deleteAccount() {
    setSaving(true)
    await supabase.from('licenses').delete().eq('id', license.id)
    setSaving(false)
    onChanged()
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.section
        className="card modal-card"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="section-heading">
          <h3>{keyRow?.discord_username || keyRow?.discord_id || license.license_key}</h3>
          <button className="link-button" onClick={onClose}>Fechar</button>
        </div>

        <div className="user-detail-grid">
          <div>
            <div className="license">
              <div><span>Chave</span><strong>{license.license_key}</strong></div>
              <div><span>Status</span><strong>{license.status}</strong></div>
              <div><span>HWID</span><strong>{license.hwid ? license.hwid.slice(0, 13) + '…' : 'Sem dispositivo'}</strong></div>
            </div>

            <div className="user-actions">
              <label>
                <span>Plano</span>
                <select value={plan} onChange={(e) => setPlan(e.target.value)}>
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <button className="opt-run" disabled={saving} onClick={() => update({ plan_id: plan })}>Salvar plano</button>

              <label>
                <span>Validade</span>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </label>
              <button className="opt-run" disabled={saving} onClick={() => update({ expires_at: expiresAt ? new Date(expiresAt).toISOString() : null })}>
                Salvar validade
              </button>

              <button className="opt-run" disabled={saving} onClick={() => update({ hwid: null })}>
                <RotateCcw size={13} /> Resetar HWID
              </button>

              <button className="opt-run" disabled={saving} onClick={() => toggleStatus('BANNED')}>
                <Ban size={13} /> {license.status === 'BANNED' ? 'Desbanir' : 'Banir'}
              </button>

              <button className="opt-run" disabled={saving} onClick={() => toggleStatus('DISABLED')}>
                {license.status === 'DISABLED' ? 'Reativar' : 'Suspender'}
              </button>

              {!confirmDelete ? (
                <button className="opt-run danger-button" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={13} /> Apagar conta
                </button>
              ) : (
                <button className="opt-run danger-button" disabled={saving} onClick={deleteAccount}>
                  <Trash2 size={13} /> Confirmar exclusão?
                </button>
              )}
            </div>
          </div>

          <div className="user-history">
            <h4>Sessões ({sessions.length})</h4>
            <div className="user-history-list">
              {loading && <p>Carregando...</p>}
              {!loading && sessions.length === 0 && <p>Nenhuma sessão registrada.</p>}
              {sessions.map((s) => (
                <div className="user-history-item" key={s.id}>
                  {s.computer_name || 'Computador desconhecido'} · {s.os_platform || '—'} {s.os_arch || ''}
                  <small>{new Date(s.created_at).toLocaleString('pt-BR')}</small>
                </div>
              ))}
            </div>

            <h4>Histórico ({logs.length})</h4>
            <div className="user-history-list">
              {loading && <p>Carregando...</p>}
              {!loading && logs.length === 0 && <p>Nenhum evento registrado.</p>}
              {logs.map((l) => (
                <div className="user-history-item" key={l.id}>
                  {l.message || l.action}
                  <small>{new Date(l.created_at).toLocaleString('pt-BR')}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function AdminPanel({ adminRow, onLogout }) {
  const [keys, setKeys] = useState([])
  const [licenses, setLicenses] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPlan, setNewPlan] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState('')
  const [selected, setSelected] = useState(null)

  async function load() {
    setLoading(true)
    const [{ data: k }, { data: l }, { data: p }] = await Promise.all([
      supabase.from('license_keys').select('*').order('created_at', { ascending: false }),
      supabase.from('licenses').select('*').order('created_at', { ascending: false }),
      supabase.from('plans').select('*')
    ])
    setKeys(k || [])
    setLicenses(l || [])
    setPlans(p || [])
    setNewPlan((current) => current || p?.[0]?.id || '')
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function createKey(event) {
    event.preventDefault()
    setCreating(true)
    const key = generateKey()
    const { error } = await supabase.from('license_keys').insert({ key, plan: newPlan, status: 'active' })
    setCreating(false)
    if (!error) {
      setCreatedKey(key)
      load()
    }
  }

  async function toggleBlock(row) {
    const nextStatus = row.status === 'blocked' ? 'active' : 'blocked'
    await supabase.from('license_keys').update({ status: nextStatus }).eq('id', row.id)
    load()
  }

  const keyByValue = Object.fromEntries(keys.map((k) => [k.key, k]))

  return (
    <motion.div className="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <header className="page-head">
        <div>
          <small>ADMIN</small>
          <h1>Painel administrativo</h1>
          <p>Logado como {adminRow.discord_username || 'admin'} · {adminRow.role}</p>
        </div>
        <button className="opt-run" onClick={onLogout}>
          <LogOut size={14} /> Sair do admin
        </button>
      </header>

      <section className="card">
        <h3>Criar nova chave</h3>
        <form className="admin-create-row" onSubmit={createKey}>
          <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="opt-run" disabled={creating || !newPlan}>
            <Plus size={14} /> {creating ? 'Criando...' : 'Gerar chave'}
          </button>
        </form>
        {createdKey && (
          <div className="opt-result ok">
            <KeyRound size={13} />
            <span>Chave criada: {createdKey}</span>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Chaves ({keys.length})</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Chave</th><th>Plano</th><th>Status</th><th>Discord</th><th>Ativada</th><th>Expira</th><th></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td>{k.key}</td>
                    <td>{k.plan}</td>
                    <td><span className={'badge ' + k.status}>{k.status}</span></td>
                    <td>{k.discord_username || k.discord_id || '—'}</td>
                    <td>{k.first_used_at ? new Date(k.first_used_at).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>{k.expires_at ? new Date(k.expires_at).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <button className="link-button" onClick={() => toggleBlock(k)}>
                        {k.status === 'blocked' ? <><ShieldCheck size={13} /> Desbloquear</> : <><ShieldOff size={13} /> Bloquear</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Usuários ({licenses.length})</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Discord</th><th>Chave</th><th>Plano</th><th>Status</th><th>HWID</th><th>Ativada em</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((l) => {
                  const k = keyByValue[l.license_key]
                  return (
                    <tr key={l.id} className="row-clickable" onClick={() => setSelected(l)}>
                      <td>{k?.discord_username || k?.discord_id || '—'}</td>
                      <td>{l.license_key}</td>
                      <td>{l.plan_id}</td>
                      <td><span className={'badge ' + l.status.toLowerCase()}>{l.status}</span></td>
                      <td>{l.hwid ? l.hwid.slice(0, 13) + '…' : '—'}</td>
                      <td>{l.activated_at ? new Date(l.activated_at).toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <UserDetailModal
          license={selected}
          keyRow={keyByValue[selected.license_key]}
          plans={plans}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}
    </motion.div>
  )
}

export default function Admin() {
  const [adminRow, setAdminRow] = useState(undefined)

  async function check() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setAdminRow(null)
      return
    }
    const { data } = await supabase.from('admins').select('*').eq('id', session.user.id).maybeSingle()
    setAdminRow(data || null)
  }

  useEffect(() => {
    check()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setAdminRow(null)
  }

  if (adminRow === undefined) {
    return (
      <div className="page">
        <p>Verificando acesso...</p>
      </div>
    )
  }

  if (!adminRow) {
    return <AdminLoginForm onSuccess={check} />
  }

  return <AdminPanel adminRow={adminRow} onLogout={logout} />
}
