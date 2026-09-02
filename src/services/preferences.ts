import type { Team } from '../types/football'

const favoriteTeamKey = '90-plus:favorite-team'
export type FavoriteTeam = Pick<Team, 'id' | 'name' | 'logo'>

export function getFavoriteTeam(): FavoriteTeam | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(favoriteTeamKey)
    if (!saved) return null
    const team = JSON.parse(saved) as FavoriteTeam
    return typeof team.id === 'number' && typeof team.name === 'string' ? team : null
  } catch { return null }
}

export function setFavoriteTeam(team: FavoriteTeam | null) {
  if (typeof window === 'undefined') return
  if (team) localStorage.setItem(favoriteTeamKey, JSON.stringify(team))
  else localStorage.removeItem(favoriteTeamKey)
}
