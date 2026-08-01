const KEY = 'llz.discord.account'

export function getConnectedDiscord() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null
  }
}

export function setConnectedDiscord(account) {
  localStorage.setItem(KEY, JSON.stringify(account))
}

export function clearConnectedDiscord() {
  localStorage.removeItem(KEY)
}

// Extrai um nome de exibição e avatar de uma identidade Discord vinda do Supabase Auth.
// O nome do campo exato varia conforme a versão do provider do Supabase, por isso tenta
// alguns candidatos em ordem antes de cair para o ID (sempre presente).
export function extractDiscordIdentity(user) {
  const identity = user?.identities?.find((i) => i.provider === 'discord')
  if (!identity) return null
  const data = identity.identity_data || {}
  const username =
    data.full_name ||
    data.name ||
    data.preferred_username ||
    data.custom_claims?.global_name ||
    data.provider_id ||
    'Discord'
  return {
    username,
    avatarUrl: data.avatar_url || null,
    avatarInitial: username.charAt(0).toUpperCase()
  }
}
