import { Link } from 'react-router-dom'
import type { Fixture, MatchDetail, TeamLineup } from '../types/football'
import { imageSrc } from '../lib/image'

export function Lineups({ lineups }: { lineups: TeamLineup[] }) {
  return <div className="lineup-grid">{lineups.map(lineup => <section key={lineup.team.id} className="lineup-team"><header>{lineup.team.logo && <img src={imageSrc(lineup.team.logo)} alt="" />}<span><b>{lineup.team.name}</b>{lineup.formation && <small>{lineup.formation}</small>}</span></header>{lineup.coach && <p className="coach">Técnico: {lineup.coach}</p>}{lineup.starters.every(player => player.grid) && <Formation lineup={lineup} />}<PlayerList title="Titulares" players={lineup.starters} />{lineup.substitutes.length > 0 && <PlayerList title="Reservas" players={lineup.substitutes} />}</section>)}</div>
}

function Formation({ lineup }: { lineup: TeamLineup }) { return <div className="formation-pitch" aria-label={`Formação ${lineup.formation ?? ''} de ${lineup.team.name}`}>{lineup.starters.map(player => { const [row, column] = player.grid!.split(':'); return <span key={player.id ?? player.name} style={{ gridRow: row, gridColumn: column }} title={player.name}>{player.number ?? '•'}</span> })}</div> }

function PlayerList({ title, players }: { title: string; players: TeamLineup['starters'] }) { return <div className="player-list"><h3>{title}</h3>{players.map((player, index) => <div key={`${player.id ?? player.name}-${index}`}><span className="shirt">{player.number ?? '—'}</span>{player.id ? <Link to={`/jogadores/${player.id}`}>{player.name}</Link> : <span>{player.name}</span>}{player.position && <small>{player.position}</small>}</div>)}</div> }

export function Statistics({ detail }: { detail: MatchDetail }) {
  if (!detail.statistics || detail.statistics.length < 2) return null
  const [home, away] = detail.statistics
  const byName = new Map<string, [string | number | undefined, string | number | undefined]>()
  for (const stat of home.values) byName.set(stat.name, [stat.value, undefined])
  for (const stat of away.values) { const pair = byName.get(stat.name) ?? [undefined, undefined]; pair[1] = stat.value; byName.set(stat.name, pair) }
  return <div className="stat-list">{[...byName].map(([name, [homeValue, awayValue]]) => <div key={name}><b>{homeValue ?? '—'}</b><span>{name}</span><b>{awayValue ?? '—'}</b></div>)}</div>
}

export function H2H({ fixtures }: { fixtures: Fixture[] }) { return <div className="h2h-list">{fixtures.map(fixture => <Link to={`/partidas/${fixture.id}`} key={fixture.id}><span>{fixture.league.name}<small>{dateLabel(fixture.startsAt)}{fixture.venue ? ` · ${fixture.venue}` : ''}</small></span><b>{fixture.home.name} {fixture.score ? `${fixture.score.home} × ${fixture.score.away}` : '×'} {fixture.away.name}</b></Link>)}</div> }

export function Events({ detail }: { detail: MatchDetail }) { return <ol className="event-list">{detail.events?.map((event, index) => <li key={`${event.elapsed ?? 0}-${event.type}-${index}`}><b>{event.elapsed ?? '—'}{event.extra ? `+${event.extra}` : ''}'</b><span>{event.player?.name ?? event.team.name}<small>{[event.type, event.detail, event.assist?.name ? `Assistência: ${event.assist.name}` : ''].filter(Boolean).join(' · ')}</small></span></li>)}</ol> }

function dateLabel(iso: string) { return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso)) }
