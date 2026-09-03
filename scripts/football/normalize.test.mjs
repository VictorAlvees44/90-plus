import { describe, expect, it } from 'vitest'
import { normalizeFootballDataFixture, normalizeMatchDetail, normalizePlayerProfile, normalizeStatus, normalizeTeamProfile } from './normalize.mjs'

describe('normalização API-Football', () => {
  it('mapeia os status de finalização', () => {
    expect(normalizeStatus('FT')).toBe('finished')
    expect(normalizeStatus('PEN')).toBe('after_penalties')
    expect(normalizeStatus('CANC')).toBe('cancelled')
  })

  it('normaliza a resposta de contingência do football-data.org', () => {
    const fixture = normalizeFootballDataFixture({ id: 42, utcDate: '2026-09-03T19:30:00Z', status: 'TIMED', area: { name: 'Brazil' }, competition: { id: 2013, name: 'Campeonato Brasileiro Série A', emblem: 'https://example.test/league.png' }, homeTeam: { id: 1, name: 'Casa', crest: 'https://example.test/home.png' }, awayTeam: { id: 2, name: 'Fora', crest: 'https://example.test/away.png' }, score: { fullTime: { home: null, away: null } } })
    expect(fixture).toEqual(expect.objectContaining({ id: -42, status: 'scheduled', league: expect.objectContaining({ country: 'Brazil' }), home: expect.objectContaining({ name: 'Casa' }) }))
    expect(fixture.score).toBeUndefined()
  })

  it('remove campos de detalhes que a API não forneceu', () => {
    const detail = normalizeMatchDetail({ fixture: { id: 1, date: '2026-08-31T18:00:00Z', status: { short: 'NS', elapsed: null }, venue: {} }, league: { id: 1, name: 'Liga' }, teams: { home: { id: 1, name: 'Casa' }, away: { id: 2, name: 'Fora' } }, goals: { home: null, away: null }, events: [], lineups: [], statistics: [] }, '2026-08-31T12:00:00Z')
    expect(detail).toEqual(expect.objectContaining({ updatedAt: '2026-08-31T12:00:00Z', fixture: expect.objectContaining({ id: 1 }) }))
    expect(detail.events).toBeUndefined()
    expect(detail.lineups).toBeUndefined()
    expect(detail.statistics).toBeUndefined()
  })
  it('normaliza um perfil de clube sem estimar estatísticas', () => {
    const profile = normalizeTeamProfile({ team: { id: 1, name: 'Clube', logo: 'logo' }, venue: { name: 'Estádio' } }, [{ players: [{ id: 7, name: 'Jogador', number: 10, position: 'Attacker' }] }], { fixtures: { played: { total: 3 }, wins: { total: 2 }, draws: { total: 1 }, loses: { total: 0 } }, goals: { for: { total: { total: 5 } }, against: { total: { total: 2 } } } }, { id: 1, name: 'Liga', season: 2026 }, '2026-08-31T12:00:00Z')
    expect(profile.squad?.[0]).toEqual(expect.objectContaining({ id: 7, number: 10 }))
    expect(profile.statistics).toEqual(expect.objectContaining({ played: 3, goalsFor: 5 }))
  })
  it('mantém apenas os dados reais de carreira do jogador', () => {
    const profile = normalizePlayerProfile({ id: 10, name: 'Atleta', team: { id: 1, name: 'Clube' } }, [{ player: { nationality: 'Brasil', birth: { date: '2000-01-01' } }, statistics: [{ league: { name: 'Liga' }, games: { appearences: 2, minutes: 120 }, goals: { total: 1, assists: null }, cards: { yellow: 0, red: 0 } }] }], [{ transfers: [{ date: '2024-01-01', teams: { out: { name: 'A' }, in: { name: 'B' } }, type: 'Free' }] }], [{ league: 'Copa', season: 2024, place: 'Winner' }], '2026-09-02T12:00:00Z')
    expect(profile.player.nationality).toBe('Brasil')
    expect(profile.player.team).toBeUndefined()
    expect(profile.team).toEqual({ id: 1, name: 'Clube' })
    expect(profile.transfers?.[0]).toEqual(expect.objectContaining({ from: 'A', to: 'B' }))
  })
})
