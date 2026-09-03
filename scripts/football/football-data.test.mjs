import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchFootballDataFixtures } from './football-data.mjs'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

describe('contingência football-data.org', () => {
  it('faz uma consulta por competição e preserva o formato dos jogos', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ matches: [{ id: 99, utcDate: '2026-09-03T19:30:00Z', status: 'SCHEDULED', area: { name: 'Brazil' }, competition: { id: 2013, name: 'Brasileirão' }, homeTeam: { id: 1, name: 'Casa' }, awayTeam: { id: 2, name: 'Fora' }, score: { fullTime: { home: null, away: null } } }] }) })
    const result = await fetchFootballDataFixtures({ token: 'test-token', dateFrom: '2026-09-02', dateTo: '2026-09-04' })
    expect(globalThis.fetch).toHaveBeenCalledTimes(5)
    expect(result.fixtures).toHaveLength(5)
    expect(result.fixtures[0]).toEqual(expect.objectContaining({ id: -99, status: 'scheduled' }))
  })
})
