import { useCallback, useEffect, useState } from 'react'

export function useData<T>(request: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const load = useCallback(() => { request().then(value => { setData(value); setError(false) }).catch(() => setError(true)).finally(() => setLoading(false)) }, [request])
  useEffect(() => { load() }, [load])
  return { data, error, loading, reload: load }
}
