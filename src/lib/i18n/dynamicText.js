export function actionName(t, action) {
  const key = `actions.${action.id}.name`
  const value = t(key)
  return value === key ? action.name : value
}

export function actionDescription(t, action) {
  const key = `actions.${action.id}.description`
  const value = t(key)
  return value === key ? action.description : value
}

export function actionNote(t, id) {
  const key = `actionNotes.${id}`
  const value = t(key)
  return value === key ? undefined : value
}

export function driverName(t, driver) {
  const key = `driversCatalog.${driver.id}.name`
  const value = t(key)
  return value === key ? driver.name : value
}

export function driverDescription(t, driver) {
  const key = `driversCatalog.${driver.id}.description`
  const value = t(key)
  return value === key ? driver.description : value
}

export function teamRole(t, person) {
  const key = `about.roles.${person.name}`
  const value = t(key)
  return value === key ? person.role : value
}

const LOCALE_MAP = {
  'pt-BR': 'pt-BR',
  'pt-PT': 'pt-PT',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT'
}

export function getLocale(language) {
  return LOCALE_MAP[language] || 'pt-BR'
}
