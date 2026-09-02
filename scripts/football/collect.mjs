import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { competitionTargetFor, isEligibleLeague } from './competitions.mjs'
import { dateInSaoPaulo, normalizeFixture, normalizePlayerProfile, normalizeTeamProfile } from './normalize.mjs'

const root = resolve(import.meta.dirname, '../..')
const dataDir = resolve(root, 'public/data')
const apiRoot = 'https://v3.football.api-sports.io'
const quota = { used: 0, limit: 100, failures: [] }
const now = new Date()
const today = dateInSaoPaulo(now)
const token = process.env.API_FOOTBALL_KEY
const collectProfiles = process.env.COLLECT_PROFILES === '1' || process.argv.includes('--profiles')

function log(event, details = {}) { console.log(JSON.stringify({ at: new Date().toISOString(), event, ...details })) }
function addDays(date, days) { const copy = new Date(`${date}T12:00:00Z`); copy.setUTCDate(copy.getUTCDate() + days); return copy.toISOString().slice(0, 10) }
async function preserveOnFailure(path, payload) {
  const absolute = resolve(dataDir, path)
  await mkdir(dirname(absolute), { recursive: true })
  const temporary = `${absolute}.tmp`
  await writeFile(temporary, `${JSON.stringify(payload, null, 2)}\n`)
  await rename(temporary, absolute)
}
async function readSnapshot(path) { return readFile(resolve(dataDir, path), 'utf8').then(JSON.parse).catch(() => null) }
async function cacheTeamLogo(team) {
  if (!team.logo?.startsWith('https://')) return
  const relativePath = `data/media/teams/${team.id}.png`
  const target = resolve(dataDir, relativePath)
  const cached = await access(target).then(() => true).catch(() => false)
  if (cached) {
    team.logo = relativePath
    return
  }
  try {
    const response = await fetch(team.logo)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    await mkdir(dirname(target), { recursive: true })
    const temporary = `${target}.tmp`
    await writeFile(temporary, new Uint8Array(await response.arrayBuffer()))
    await rename(temporary, target)
    team.logo = relativePath
  } catch (error) {
    log('team_logo_skipped', { team: team.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' })
  }
}
async function cacheFixtureLogos(fixtures) {
  const teams = [...new Map(fixtures.flatMap(fixture => [fixture.home, fixture.away]).map(team => [team.id, team])).values()]
  for (const team of teams) await cacheTeamLogo(team)
  const cachedTeams = new Map(teams.map(team => [team.id, team.logo]))
  for (const fixture of fixtures) {
    fixture.home.logo = cachedTeams.get(fixture.home.id) ?? fixture.home.logo
    fixture.away.logo = cachedTeams.get(fixture.away.id) ?? fixture.away.logo
  }
}
function supportsMatchDetails(league) {
  const fixtures = league.coverage?.fixtures
  return Boolean(fixtures?.events || fixtures?.lineups || fixtures?.statistics_fixtures || fixtures?.statistics_players)
}
async function api(path) {
  if (quota.used >= quota.limit - 5) throw new Error('Quota de segurança atingida; dados atuais foram preservados.')
  quota.used += 1
  const response = await fetch(`${apiRoot}${path}`, { headers: { 'x-apisports-key': token } })
  if (response.status === 429) throw new Error('A API-Football informou limite de requisições (429).')
  if (!response.ok) throw new Error(`API-Football respondeu HTTP ${response.status} em ${path}.`)
  const body = await response.json()
  if (body.errors && Object.keys(body.errors).length > 0) {
    const details = Object.entries(body.errors).map(([field, message]) => `${field}: ${Array.isArray(message) ? message.join(', ') : message}`).join('; ')
    throw new Error(`API-Football retornou erro em ${path}: ${details}`)
  }
  log('request_ok', { endpoint: path, results: body.results, quotaUsed: quota.used })
  return body.response ?? []
}

async function main() {
  if (!token) throw new Error('API_FOOTBALL_KEY não configurada. A chave deve existir apenas em variável de ambiente ou GitHub Secret.')
  log('collection_started', { today, quotaLimit: quota.limit })
  try {
    // /leagues carries season-level coverage. We save only validated targets.
    const leagues = await api('/leagues?current=true')
    const selectedLeagues = leagues.filter(isEligibleLeague).map(item => ({
      id: item.league.id, name: item.league.name, country: item.country.name, logo: item.league.logo,
      season: item.seasons.find(season => season.current)?.year ?? null,
      coverage: item.seasons.find(season => season.current)?.coverage ?? null,
      priority: competitionTargetFor({ country: item.country.name, name: item.league.name })?.priority ?? 99
    })).sort((a, b) => a.priority - b.priority)

    // Free accounts require an additional filter with from/to and do not allow
    // the global last filter. Three explicit dates preserve the 16-call budget.
    const [recentRaw, todayRaw, upcomingRaw] = await Promise.all([
      api(`/fixtures?date=${addDays(today, -1)}`),
      api(`/fixtures?date=${today}`),
      api(`/fixtures?date=${addDays(today, 1)}`)
    ])
    // A cup can have fixtures today without being returned by /leagues?current.
    // Discover those allowed national competitions from the fixture response too.
    for (const raw of [...recentRaw, ...todayRaw, ...upcomingRaw]) {
      const target = competitionTargetFor({ country: raw.league.country, name: raw.league.name })
      if (!target || selectedLeagues.some(league => league.id === raw.league.id)) continue
      selectedLeagues.push({ id: raw.league.id, name: raw.league.name, country: raw.league.country, ...(raw.league.logo ? { logo: raw.league.logo } : {}), season: raw.league.season ?? null, coverage: null, priority: target.priority })
    }
    selectedLeagues.sort((a, b) => a.priority - b.priority)
    await preserveOnFailure('leagues/enabled.json', { updatedAt: new Date().toISOString(), leagues: selectedLeagues })
    const selectedIds = new Set(selectedLeagues.map(league => league.id))
    const selected = raw => raw.filter(item => selectedIds.has(item.league.id)).map(normalizeFixture)
    const timestamp = new Date().toISOString()
    const recent = selected(recentRaw)
    const todayFixtures = selected(todayRaw)
    const upcoming = selected(upcomingRaw)
    const fixtureIndex = [...recent, ...todayFixtures, ...upcoming]
    await cacheFixtureLogos(fixtureIndex)
    await preserveOnFailure('fixtures/recent.json', { updatedAt: timestamp, fixtures: recent })
    await preserveOnFailure('fixtures/today.json', { updatedAt: timestamp, fixtures: todayFixtures })
    await preserveOnFailure('fixtures/upcoming.json', { updatedAt: timestamp, fixtures: upcoming })
    await preserveOnFailure('fixtures/index.json', { updatedAt: timestamp, fixtures: fixtureIndex })

    // The Free plan does not include the ids bulk endpoint used for match
    // events, lineups and statistics. Keep the candidate list for team
    // profiles, while publishing those optional match details only on plans
    // that support their source endpoint.
    const leagueById = new Map(selectedLeagues.map(league => [league.id, league]))
    const rawFixtures = [...recentRaw, ...todayRaw, ...upcomingRaw]
    const candidates = [...new Map(rawFixtures.filter(raw => {
      const league = leagueById.get(raw.league.id)
      return league && supportsMatchDetails(league)
    }).map(raw => [raw.fixture.id, raw])).values()].slice(0, 6)
    const details = []

    // Player rosters and team context are long-cache data and run once a day,
    // separately from the lightweight match schedule. Six teams plus four
    // scoring lists keep the daily total safely below the 100-request plan limit.
    const profiles = []
    if (collectProfiles) {
      const teamsToEnrich = [...new Map(candidates.flatMap(raw => {
        const league = leagueById.get(raw.league.id)
        return [raw.teams.home, raw.teams.away].map(team => [team.id, { team, league }])
      })).values()].slice(0, 6)
      for (const candidate of teamsToEnrich) {
        let teamResponse
        try { teamResponse = (await api(`/teams?id=${candidate.team.id}`))[0] } catch (error) { log('team_skipped', { team: candidate.team.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }); continue }
        if (!teamResponse?.team) continue
        let squadResponse
        let statisticsResponse
        try { squadResponse = await api(`/players/squads?team=${candidate.team.id}`) } catch (error) { log('squad_skipped', { team: candidate.team.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
        if (candidate.league?.season) {
          try { statisticsResponse = await api(`/teams/statistics?league=${candidate.league.id}&season=${candidate.league.season}&team=${candidate.team.id}`) } catch (error) { log('team_statistics_skipped', { team: candidate.team.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
        }
        const profile = normalizeTeamProfile(teamResponse, squadResponse, statisticsResponse, candidate.league, timestamp)
        profiles.push(profile)
        await preserveOnFailure(`teams/${profile.team.id}.json`, profile)
        for (const player of profile.squad ?? []) await preserveOnFailure(`players/${player.id}.json`, { updatedAt: timestamp, player, team: profile.team })
      }
      const playersToEnrich = profiles.flatMap(profile => (profile.squad ?? []).map(player => ({ player, team: profile.team, league: profile.statistics?.league }))).sort((left, right) => Number(![7, 9, 10].includes(left.player.number ?? 0)) - Number(![7, 9, 10].includes(right.player.number ?? 0))).slice(0, 3)
      for (const candidate of playersToEnrich) {
        let playerResponse
        let transfersResponse
        let trophiesResponse
        try { playerResponse = await api(`/players?id=${candidate.player.id}&season=${candidate.league?.season ?? new Date().getFullYear()}`) } catch (error) { log('player_statistics_skipped', { player: candidate.player.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
        try { transfersResponse = await api(`/transfers?player=${candidate.player.id}`) } catch (error) { log('transfers_skipped', { player: candidate.player.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
        try { trophiesResponse = await api(`/trophies?player=${candidate.player.id}`) } catch (error) { log('trophies_skipped', { player: candidate.player.id, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
        const previous = await readSnapshot(`players/${candidate.player.id}.json`)
        const profile = normalizePlayerProfile({ ...candidate.player, team: candidate.team }, playerResponse, transfersResponse, trophiesResponse, timestamp)
        await preserveOnFailure(`players/${candidate.player.id}.json`, { ...previous, ...profile })
      }
      const topScorers = []
      for (const league of selectedLeagues.filter(item => item.coverage?.top_scorers && item.season).slice(0, 4)) {
        try {
          const response = await api(`/players/topscorers?league=${league.id}&season=${league.season}`)
          for (const item of response) {
            const statistics = item.statistics?.[0]
            if (!item.player?.id || !item.player?.name || !statistics?.team?.id || !statistics?.team?.name) continue
            topScorers.push({ league: { id: league.id, name: league.name, season: league.season }, player: { id: item.player.id, name: item.player.name, ...(item.player.photo ? { photo: item.player.photo } : {}) }, team: { id: statistics.team.id, name: statistics.team.name, ...(statistics.team.logo ? { logo: statistics.team.logo } : {}) }, ...(statistics.goals?.total !== null && statistics.goals?.total !== undefined ? { goals: statistics.goals.total } : {}), ...(statistics.goals?.assists !== null && statistics.goals?.assists !== undefined ? { assists: statistics.goals.assists } : {}) })
          }
        } catch (error) { log('top_scorers_skipped', { league: league.name, message: error instanceof Error ? error.message : 'Erro desconhecido.' }) }
      }
      await preserveOnFailure('leagues/top-scorers.json', { updatedAt: timestamp, players: topScorers })
    }

    // Standings are the first non-fixture priority after the core match window.
    const standings = []
    for (const league of selectedLeagues.filter(item => item.coverage?.standings && item.season).slice(0, 8)) {
      try {
        const response = await api(`/standings?league=${league.id}&season=${league.season}`)
        for (const group of response[0]?.league?.standings ?? []) {
          standings.push({
            league,
            ...(group[0]?.group ? { group: group[0].group } : {}),
            rows: group.map(row => ({ rank: row.rank, team: { id: row.team.id, name: row.team.name, ...(row.team.logo ? { logo: row.team.logo } : {}) }, played: row.all.played, win: row.all.win, draw: row.all.draw, lose: row.all.lose, goalsFor: row.all.goals.for, goalsAgainst: row.all.goals.against, goalDiff: row.goalsDiff, points: row.points, ...(row.form ? { form: row.form } : {}) }))
          })
        }
      } catch (error) {
        // A single league cannot invalidate today’s fixtures or other competitions.
        log('standings_skipped', { league: league.name, message: error instanceof Error ? error.message : 'Erro desconhecido.' })
      }
    }
    await preserveOnFailure('standings/index.json', { updatedAt: timestamp, standings })
    const searchItems = [
      ...selectedLeagues.map(league => ({ type: 'league', id: league.id, label: league.name, subtitle: league.country, ...(league.logo ? { image: league.logo } : {}) })),
      ...[...new Map(fixtureIndex.flatMap(fixture => [fixture.home, fixture.away]).map(team => [team.id, team])).values()].map(team => ({ type: 'team', id: team.id, label: team.name, subtitle: 'Clube ou seleção', ...(team.logo ? { image: team.logo } : {}) })),
      ...[...new Map([...details.flatMap(detail => (detail.lineups ?? []).flatMap(lineup => [...lineup.starters, ...lineup.substitutes])), ...profiles.flatMap(profile => profile.squad ?? [])].filter(player => player.id).map(player => [player.id, player])).values()].map(player => ({ type: 'player', id: player.id, label: player.name, subtitle: 'Jogador', ...(player.photo ? { image: player.photo } : {}) }))
    ]
    await preserveOnFailure('search.json', { updatedAt: timestamp, items: searchItems })
    await preserveOnFailure('meta.json', { dataVersion: timestamp, updatedAt: timestamp, lastSuccessAt: timestamp, lastFailureAt: null, quota: { ...quota } })
    log('collection_finished', { quotaUsed: quota.used, quotaRemainingEstimate: quota.limit - quota.used, leagues: selectedLeagues.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no coletor.'
    quota.failures.push(message)
    const previous = await readFile(resolve(dataDir, 'meta.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    await preserveOnFailure('meta.json', { ...previous, lastFailureAt: new Date().toISOString(), quota: { ...quota } })
    log('collection_failed', { message, quotaUsed: quota.used })
    throw error
  }
}
main()
