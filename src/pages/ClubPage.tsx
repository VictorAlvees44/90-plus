import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyData } from '../components/EmptyData'
import { FixtureCard } from '../components/FixtureCard'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { getFixtureIndex, getTeamProfile, getTopScorers } from '../services/data'
import type { TeamProfile, TopScorer } from '../types/football'

export function ClubPage() {
  const { id } = useParams()
  const request = useCallback(() => getFixtureIndex(), [])
  const profileRequest = useCallback(() => id ? getTeamProfile(Number(id)) : Promise.resolve(null), [id])
  const scorersRequest = useCallback(() => getTopScorers(), [])
  const { data } = useData(request)
  const { data: profile } = useData(profileRequest)
  const { data: topScorers } = useData(scorersRequest)
  if (!data) return <main><PageHeader title="Clube" back /><section className="skeletons"><div /><div /></section></main>
  const fixtures = data.fixtures.filter(fixture => fixture.home.id === Number(id) || fixture.away.id === Number(id))
  const team = fixtures.find(fixture => fixture.home.id === Number(id))?.home ?? fixtures.find(fixture => fixture.away.id === Number(id))?.away
  if (!team) return <main><PageHeader title="Clube" back /><EmptyData title="Clube não disponível" text="Este perfil ainda não aparece no snapshot de partidas." /></main>
  const scorers = topScorers?.players.filter(scorer => scorer.team.id === team.id) ?? []
  return <main><PageHeader title="Clube" back /><section className="club-hero">{(profile?.team.logo ?? team.logo) && <img src={profile?.team.logo ?? team.logo} alt="" />}<h1>{profile?.team.name ?? team.name}</h1>{profile && <p>{[profile.team.country, profile.team.founded ? `Fundado em ${profile.team.founded}` : ''].filter(Boolean).join(' · ')}</p>}</section>{profile?.venue && <section className="info-panel"><h2>ESTÁDIO</h2><p>{[profile.venue.name, profile.venue.city, profile.venue.capacity ? `${profile.venue.capacity.toLocaleString('pt-BR')} lugares` : ''].filter(Boolean).join(' · ')}</p></section>}{profile?.statistics && <TeamStatistics profile={profile} />}{scorers.length > 0 && <TopScorers scorers={scorers} />}<section className="fixture-section"><h2>JOGOS DISPONÍVEIS</h2>{fixtures.slice(0, 8).map(fixture => <FixtureCard key={fixture.id} fixture={fixture} />)}</section>{profile?.squad?.length ? <section className="detail-section"><h2>ELENCO</h2><div className="squad-list">{profile.squad.map(player => <LinkPlayer key={player.id} id={player.id} name={player.name} number={player.number} position={player.position} photo={player.photo} />)}</div></section> : <section className="detail-section"><h2>ELENCO E ESTATÍSTICAS</h2><p>Estes dados serão exibidos somente quando forem coletados com cobertura da API-Football.</p></section>}</main>
}

function TeamStatistics({ profile }: { profile: TeamProfile }) { const stats = profile.statistics; if (!stats) return null; const winRate = stats.played && stats.wins !== undefined ? `${Math.round((stats.wins / stats.played) * 100)}%` : undefined; const values = [{ label: 'Jogos', value: stats.played }, { label: 'Vitórias', value: stats.wins }, { label: 'Aproveitamento', value: winRate }, { label: 'Empates', value: stats.draws }, { label: 'Derrotas', value: stats.losses }, { label: 'Gols marcados', value: stats.goalsFor }, { label: 'Gols sofridos', value: stats.goalsAgainst }].filter(item => item.value !== undefined); return <section className="info-panel"><h2>{stats.league.name.toUpperCase()} · {stats.league.season}</h2><div className="number-grid">{values.map(item => <span key={item.label}><b>{item.value}</b>{item.label}</span>)}</div>{stats.form && <p>Forma: {stats.form}</p>}</section> }
function TopScorers({ scorers }: { scorers: TopScorer[] }) { return <section className="detail-section"><h2>ARTILHEIROS DISPONÍVEIS</h2><div className="squad-list">{scorers.map(scorer => <Link key={`${scorer.league.id}-${scorer.player.id}`} to={`/jogadores/${scorer.player.id}`}>{scorer.player.photo && <img src={scorer.player.photo} alt="" />}<span className="shirt">{scorer.goals ?? '—'}</span><span><b>{scorer.player.name}</b><small>{scorer.league.name} · {scorer.goals ?? 0} gols{scorer.assists !== undefined ? ` · ${scorer.assists} assist.` : ''}</small></span></Link>)}</div></section> }
function LinkPlayer({ id, name, number, position, photo }: { id: number; name: string; number?: number; position?: string; photo?: string }) { return <Link to={`/jogadores/${id}`}>{photo && <img src={photo} alt="" />}<span className="shirt">{number ?? '—'}</span><span><b>{name}</b>{position && <small>{position}</small>}</span></Link> }
