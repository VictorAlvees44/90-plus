/**
 * IDs intentionally do not live here: API-Football can change them. The collector
 * resolves these human-readable targets via /leagues and keeps only male football.
 */
export const competitionTargets = [
  { country: 'Brazil', names: ['Serie A', 'Serie B', 'Serie C', 'Copa do Brasil', 'Paulista - A1', 'Carioca', 'Mineiro - 1', 'Gaúcho - 1', 'Paranaense - 1', 'Baiano - 1', 'Pernambucano - 1', 'Cearense'], priority: 1 },
  { country: 'England', names: ['Premier League', 'Championship', 'League One', 'League Two', 'National League', 'FA Cup', 'League Cup', 'Community Shield'], priority: 2 },
  { country: 'Spain', names: ['La Liga'], priority: 2 },
  { country: 'Italy', names: ['Serie A', 'Serie B', 'Serie C', 'Coppa Italia', 'Super Cup'], priority: 2 },
  { country: 'Germany', names: ['Bundesliga', '2. Bundesliga', '3. Liga', 'DFB Pokal', 'Super Cup'], priority: 2 },
  { country: 'France', names: ['Ligue 1'], priority: 2 },
  { country: 'World', names: ['Club World Cup', 'FIFA Intercontinental Cup'], priority: 2 },
  { country: 'World', names: ['CONMEBOL Libertadores', 'CONMEBOL Sudamericana', 'CONMEBOL Recopa'], priority: 3 },
  { country: 'World', names: ['UEFA Champions League', 'UEFA Europa League', 'UEFA Europa Conference League', 'UEFA Super Cup'], priority: 3 },
  { country: 'Argentina', names: ['Liga Profesional Argentina'], priority: 4 },
  { country: 'USA', names: ['Major League Soccer', 'Leagues Cup'], priority: 4 },
  { country: 'Mexico', names: ['Liga MX'], priority: 4 },
  { country: 'World', names: ['World Cup', 'Copa America', 'UEFA Nations League', 'Euro Championship'], priority: 4 }
]

const womenPattern = /women|femen|femin|female/i
export function competitionTargetFor(league) {
  if (womenPattern.test(league?.name ?? '')) return undefined
  return competitionTargets.find(target => target.country === league?.country && target.names.includes(league?.name))
}
export function isEligibleLeague(league) {
  return Boolean(competitionTargetFor({ country: league.country?.name, name: league.league?.name }))
}
