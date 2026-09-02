import { useCallback, useEffect, useState } from 'react'
import { getFixtureIndex } from '../services/data'
import type { FixturesSnapshot } from '../types/football'

export function useFixtures() {
  const [data, setData] = useState<FixturesSnapshot | null>(null)
  const [error, setError] = useState(false)
  const load = useCallback(() => { getFixtureIndex().then(setData).catch(() => setError(true)) }, [])
  const reload = () => { setError(false); load() }
  useEffect(() => { load() }, [load])
  return { data, error, reload }
}
