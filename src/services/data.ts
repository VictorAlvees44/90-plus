import type { DataMeta, FixturesSnapshot, LeagueStanding, MatchDetail, PlayerProfile, SearchItem, TeamProfile, TopScorer } from '../types/football'

const base = import.meta.env.BASE_URL
async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${base}${path}`, { cache: 'no-cache' })
  if (!response.ok) throw new Error(`Não foi possível carregar ${path}`)
  return response.json() as Promise<T>
}
export const getTodayFixtures = () => readJson<FixturesSnapshot>('data/fixtures/today.json')
export const getDataMeta = () => readJson<DataMeta>('data/meta.json')
export const getFixtureIndex = () => readJson<FixturesSnapshot>('data/fixtures/index.json')
export const getStandings = () => readJson<{ updatedAt: string | null; standings: LeagueStanding[] }>('data/standings/index.json')
export const getSearchIndex = () => readJson<{ updatedAt: string | null; items: SearchItem[] }>('data/search.json')
export async function getTopScorers(): Promise<{ updatedAt: string | null; players: TopScorer[] } | null> {
  const response = await fetch(`${base}data/leagues/top-scorers.json`, { cache: 'no-cache' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Não foi possível carregar artilheiros')
  return response.json() as Promise<{ updatedAt: string | null; players: TopScorer[] }>
}
export async function getMatchDetail(id: number): Promise<MatchDetail | null> {
  const response = await fetch(`${base}data/matches/${id}.json`, { cache: 'no-cache' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Não foi possível carregar detalhes da partida ${id}`)
  return response.json() as Promise<MatchDetail>
}
async function getOptionalProfile<T>(kind: 'teams' | 'players', id: number): Promise<T | null> {
  const response = await fetch(`${base}data/${kind}/${id}.json`, { cache: 'no-cache' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Não foi possível carregar o perfil ${id}`)
  return response.json() as Promise<T>
}
export const getTeamProfile = (id: number) => getOptionalProfile<TeamProfile>('teams', id)
export const getPlayerProfile = (id: number) => getOptionalProfile<PlayerProfile>('players', id)
