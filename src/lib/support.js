export const DISCORD_INVITE = 'https://discord.gg/llz'

export function openDiscordSupport() {
  if (window.llz?.system.openExternal) {
    window.llz.system.openExternal(DISCORD_INVITE)
  } else {
    window.open(DISCORD_INVITE, '_blank', 'noopener,noreferrer')
  }
}
