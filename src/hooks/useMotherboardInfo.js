import { useCallback, useEffect, useState } from 'react'

export function useMotherboardInfo() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkedAt, setCheckedAt] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.llz?.motherboard.get()
      setData(result || null)
      setCheckedAt(new Date())
    } catch (err) {
      setError(err?.message || 'Falha ao ler informações da placa-mãe.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, checkedAt, refresh }
}
