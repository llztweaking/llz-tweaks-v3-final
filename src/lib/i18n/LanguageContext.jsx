import { createContext, useContext, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, LANGUAGES } from './languages'
import { translations } from './translations'

const KEY = 'llz.language'
const LanguageContext = createContext(null)

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(KEY)
    return LANGUAGES.some((l) => l.code === stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function resolve(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), dict)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage)

  function setLanguage(code) {
    if (!LANGUAGES.some((l) => l.code === code)) return
    localStorage.setItem(KEY, code)
    setLanguageState(code)
  }

  const t = useMemo(() => {
    return (path, vars) => {
      const template =
        resolve(translations[language], path) ??
        resolve(translations[DEFAULT_LANGUAGE], path) ??
        path
      if (!vars) return template
      return Object.keys(vars).reduce((str, key) => str.replaceAll(`{${key}}`, vars[key]), template)
    }
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t, languages: LANGUAGES }), [language, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage precisa estar dentro de um LanguageProvider')
  return ctx
}
