import { normalizeFootballDataFixture } from './normalize.mjs'

const apiRoot = 'https://api.football-data.org/v4'

// These are the competitions available in the free tier that overlap with
// 90+'s selected countries. Domestic cups remain covered by API-Football or
// by the reviewed editorial file when neither provider has the fixture.
const competitions = [
  { id: 2013, name: 'Campeonato Brasileiro Série A', country: 'Brazil', priority: 1 },
  { id: 2021, name: 'Premier League', country: 'England', priority: 2 },
  { id: 2016, name: 'Championship', country: 'England', priority: 2 },
  { id: 2002, name: 'Bundesliga', country: 'Germany', priority: 2 },
  { id: 2019, name: 'Serie A', country: 'Italy', priority: 2 }
]

export async function fetchFootballDataFixtures({ token, dateFrom, dateTo, onRequest }) {
  if (!token) throw new Error('FOOTBALL_DATA_KEY não configurada.')
  const fixtures = []
  for (const competition of competitions) {
    const url = `${apiRoot}/competitions/${competition.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
    const response = await fetch(url, { headers: { 'X-Auth-Token': token } })
    if (response.status === 429) throw new Error('football-data.org informou limite de requisições (429).')
    if (!response.ok) throw new Error(`football-data.org respondeu HTTP ${response.status} para ${competition.name}.`)
    const body = await response.json()
    const matches = Array.isArray(body.matches) ? body.matches : []
    onRequest?.(competition, matches.length)
    fixtures.push(...matches.map(normalizeFootballDataFixture))
  }
  return { fixtures, leagues: competitions.map(({ id, name, country, priority }) => ({ id, name, country, priority })) }
}
