export type MatchStatus = 'scheduled' | 'postponed' | 'cancelled' | 'live' | 'halftime' | 'finished' | 'after_extra_time' | 'after_penalties' | 'suspended' | 'abandoned' | 'unknown'

export interface Team { id: number; name: string; logo?: string; national?: boolean }
export interface Fixture {
  id: number
  startsAt: string
  status: MatchStatus
  elapsed?: number
  league: { id: number; name: string; logo?: string; country?: string }
  home: Team
  away: Team
  score?: { home: number; away: number }
  venue?: string
}
export interface FixturesSnapshot { updatedAt: string | null; fixtures: Fixture[] }
export interface DataMeta { dataVersion: string; updatedAt: string | null; lastSuccessAt: string | null; lastFailureAt: string | null; quota?: { used?: number; limit?: number; failures?: string[] } }
export interface LeagueSummary { id: number; name: string; country: string; logo?: string; coverage?: { standings?: boolean }; priority: number }
export interface StandingRow { rank: number; team: Team; played: number; win: number; draw: number; lose: number; goalsFor: number; goalsAgainst: number; goalDiff: number; points: number; form?: string }
export interface LeagueStanding { league: LeagueSummary; group?: string; rows: StandingRow[] }
export interface SearchItem { type: 'team' | 'league' | 'player'; id: number; label: string; subtitle?: string; image?: string }
export interface MatchEvent { elapsed?: number; extra?: number; team: Team; player?: { id?: number; name: string }; assist?: { id?: number; name?: string }; type: string; detail?: string; comments?: string }
export interface LineupPlayer { id?: number; name: string; number?: number; position?: string; grid?: string }
export interface TeamLineup { team: Team; formation?: string; coach?: string; starters: LineupPlayer[]; substitutes: LineupPlayer[] }
export interface TeamMatchStatistics { team: Team; values: Array<{ name: string; value: string | number }> }
export interface MatchDetail { updatedAt: string; fixture: Fixture; events?: MatchEvent[]; lineups?: TeamLineup[]; statistics?: TeamMatchStatistics[]; h2h?: Fixture[] }
export interface SquadPlayer { id: number; name: string; age?: number; number?: number; position?: string; photo?: string }
export interface CompetitionStatistics { league: { id: number; name: string; season: number }; played?: number; wins?: number; draws?: number; losses?: number; goalsFor?: number; goalsAgainst?: number; form?: string }
export interface TeamProfile { updatedAt: string; team: Team & { country?: string; founded?: number; national?: boolean }; venue?: { name?: string; city?: string; capacity?: number; image?: string }; squad?: SquadPlayer[]; statistics?: CompetitionStatistics }
export interface TopScorer { league: { id: number; name: string; season: number }; player: { id: number; name: string; photo?: string }; team: Team; goals?: number; assists?: number }
export interface PlayerProfile { updatedAt: string; player: SquadPlayer & { nationality?: string; birthDate?: string }; team: Team; statistics?: Array<{ league: string; games?: number; minutes?: number; goals?: number; assists?: number; rating?: string; cards?: number }>; transfers?: Array<{ date?: string; from?: string; to?: string; type?: string }>; trophies?: Array<{ league: string; season?: string; place?: string }> }
