const statuses = {
  TBD: 'scheduled', NS: 'scheduled', PST: 'postponed', CANC: 'cancelled',
  '1H': 'live', '2H': 'live', 'ET': 'live', BT: 'live', INT: 'live', LIVE: 'live', HT: 'halftime',
  FT: 'finished', AET: 'after_extra_time', PEN: 'after_penalties', SUSP: 'suspended', ABD: 'abandoned'
}

export function normalizeStatus(short) { return statuses[short] ?? 'unknown' }

export function normalizeFixture(item) {
  return {
    id: item.fixture.id,
    startsAt: item.fixture.date,
    status: normalizeStatus(item.fixture.status.short),
    ...(item.fixture.status.elapsed !== null ? { elapsed: item.fixture.status.elapsed } : {}),
    league: { id: item.league.id, name: item.league.name, ...(item.league.logo ? { logo: item.league.logo } : {}), ...(item.league.country ? { country: item.league.country } : {}) },
    home: { id: item.teams.home.id, name: item.teams.home.name, ...(item.teams.home.logo ? { logo: item.teams.home.logo } : {}) },
    away: { id: item.teams.away.id, name: item.teams.away.name, ...(item.teams.away.logo ? { logo: item.teams.away.logo } : {}) },
    ...(item.goals.home !== null && item.goals.away !== null ? { score: { home: item.goals.home, away: item.goals.away } } : {}),
    ...(item.fixture.venue?.name ? { venue: item.fixture.venue.name } : {})
  }
}

function normalizePerson(person) {
  return person?.name ? { ...(person.id ? { id: person.id } : {}), name: person.name } : undefined
}

function normalizeLineupPlayer(entry) {
  const player = entry?.player ?? entry
  if (!player?.name) return null
  return { ...(player.id ? { id: player.id } : {}), name: player.name, ...(player.number !== null && player.number !== undefined ? { number: player.number } : {}), ...(player.pos ? { position: player.pos } : {}), ...(player.grid ? { grid: player.grid } : {}) }
}

export function normalizeMatchDetail(item, updatedAt) {
  const fixture = normalizeFixture(item)
  const events = Array.isArray(item.events) ? item.events.map(event => ({
    ...(event.time?.elapsed !== null && event.time?.elapsed !== undefined ? { elapsed: event.time.elapsed } : {}),
    ...(event.time?.extra !== null && event.time?.extra !== undefined ? { extra: event.time.extra } : {}),
    team: { id: event.team.id, name: event.team.name, ...(event.team.logo ? { logo: event.team.logo } : {}) },
    ...(normalizePerson(event.player) ? { player: normalizePerson(event.player) } : {}),
    ...(normalizePerson(event.assist) ? { assist: normalizePerson(event.assist) } : {}),
    type: event.type,
    ...(event.detail ? { detail: event.detail } : {}),
    ...(event.comments ? { comments: event.comments } : {})
  })) : undefined
  const lineups = Array.isArray(item.lineups) ? item.lineups.map(lineup => ({
    team: { id: lineup.team.id, name: lineup.team.name, ...(lineup.team.logo ? { logo: lineup.team.logo } : {}) },
    ...(lineup.formation ? { formation: lineup.formation } : {}),
    ...(lineup.coach?.name ? { coach: lineup.coach.name } : {}),
    starters: (lineup.startXI ?? []).map(normalizeLineupPlayer).filter(Boolean),
    substitutes: (lineup.substitutes ?? []).map(normalizeLineupPlayer).filter(Boolean)
  })) : undefined
  const statistics = Array.isArray(item.statistics) ? item.statistics.map(group => ({
    team: { id: group.team.id, name: group.team.name, ...(group.team.logo ? { logo: group.team.logo } : {}) },
    values: (group.statistics ?? []).filter(statistic => statistic.value !== null && statistic.value !== undefined).map(statistic => ({ name: statistic.type, value: statistic.value }))
  })).filter(group => group.values.length > 0) : undefined
  return {
    updatedAt,
    fixture,
    ...(events?.length ? { events } : {}),
    ...(lineups?.some(lineup => lineup.starters.length || lineup.substitutes.length) ? { lineups } : {}),
    ...(statistics?.length ? { statistics } : {})
  }
}

export function normalizeSquadPlayer(player) {
  return { id: player.id, name: player.name, ...(player.age !== null && player.age !== undefined ? { age: player.age } : {}), ...(player.number !== null && player.number !== undefined ? { number: player.number } : {}), ...(player.position ? { position: player.position } : {}), ...(player.photo ? { photo: player.photo } : {}) }
}

export function normalizeTeamProfile(item, squadResponse, statisticsResponse, league, updatedAt) {
  const team = item.team
  const venue = item.venue
  const statistics = statisticsResponse && league ? {
    league: { id: league.id, name: league.name, season: league.season },
    ...(statisticsResponse.fixtures?.played?.total !== null && statisticsResponse.fixtures?.played?.total !== undefined ? { played: statisticsResponse.fixtures.played.total } : {}),
    ...(statisticsResponse.fixtures?.wins?.total !== null && statisticsResponse.fixtures?.wins?.total !== undefined ? { wins: statisticsResponse.fixtures.wins.total } : {}),
    ...(statisticsResponse.fixtures?.draws?.total !== null && statisticsResponse.fixtures?.draws?.total !== undefined ? { draws: statisticsResponse.fixtures.draws.total } : {}),
    ...(statisticsResponse.fixtures?.loses?.total !== null && statisticsResponse.fixtures?.loses?.total !== undefined ? { losses: statisticsResponse.fixtures.loses.total } : {}),
    ...(statisticsResponse.goals?.for?.total?.total !== null && statisticsResponse.goals?.for?.total?.total !== undefined ? { goalsFor: statisticsResponse.goals.for.total.total } : {}),
    ...(statisticsResponse.goals?.against?.total?.total !== null && statisticsResponse.goals?.against?.total?.total !== undefined ? { goalsAgainst: statisticsResponse.goals.against.total.total } : {}),
    ...(statisticsResponse.form ? { form: statisticsResponse.form } : {})
  } : undefined
  return {
    updatedAt,
    team: { id: team.id, name: team.name, ...(team.logo ? { logo: team.logo } : {}), ...(team.country ? { country: team.country } : {}), ...(team.founded ? { founded: team.founded } : {}), ...(team.national !== null && team.national !== undefined ? { national: team.national } : {}) },
    ...(venue ? { venue: { ...(venue.name ? { name: venue.name } : {}), ...(venue.city ? { city: venue.city } : {}), ...(venue.capacity ? { capacity: venue.capacity } : {}), ...(venue.image ? { image: venue.image } : {}) } } : {}),
    ...(Array.isArray(squadResponse?.[0]?.players) ? { squad: squadResponse[0].players.map(normalizeSquadPlayer) } : {}),
    ...(statistics ? { statistics } : {})
  }
}

export function normalizePlayerProfile(current, playerResponse, transfersResponse, trophiesResponse, updatedAt) {
  const { team, ...currentPlayer } = current
  const source = playerResponse?.[0]
  const player = source?.player
  const statistics = Array.isArray(source?.statistics) ? source.statistics.map(item => ({
    league: item.league?.name,
    ...(item.games?.appearences !== null && item.games?.appearences !== undefined ? { games: item.games.appearences } : {}),
    ...(item.games?.minutes !== null && item.games?.minutes !== undefined ? { minutes: item.games.minutes } : {}),
    ...(item.goals?.total !== null && item.goals?.total !== undefined ? { goals: item.goals.total } : {}),
    ...(item.goals?.assists !== null && item.goals?.assists !== undefined ? { assists: item.goals.assists } : {}),
    ...(item.games?.rating ? { rating: item.games.rating } : {}),
    ...((item.cards?.yellow || item.cards?.red) ? { cards: (item.cards.yellow ?? 0) + (item.cards.red ?? 0) } : {})
  })).filter(item => item.league) : undefined
  const transfers = Array.isArray(transfersResponse?.[0]?.transfers) ? transfersResponse[0].transfers.map(item => ({ ...(item.date ? { date: item.date } : {}), ...(item.teams?.out?.name ? { from: item.teams.out.name } : {}), ...(item.teams?.in?.name ? { to: item.teams.in.name } : {}), ...(item.type ? { type: item.type } : {}) })) : undefined
  const trophies = Array.isArray(trophiesResponse) ? trophiesResponse.filter(item => item.league).map(item => ({ league: item.league, ...(item.season ? { season: String(item.season) } : {}), ...(item.place ? { place: item.place } : {}) })) : undefined
  return {
    updatedAt,
    player: { ...currentPlayer, ...(player?.nationality ? { nationality: player.nationality } : {}), ...(player?.birth?.date ? { birthDate: player.birth.date } : {}) },
    team,
    ...(statistics?.length ? { statistics } : {}),
    ...(transfers?.length ? { transfers } : {}),
    ...(trophies?.length ? { trophies } : {})
  }
}

export function dateInSaoPaulo(iso) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso))
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}
