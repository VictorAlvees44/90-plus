import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Clock3, MapPin, Radio } from 'lucide-react'
import { EmptyData } from '../components/EmptyData'
import { Events, H2H, Lineups, Statistics } from '../components/MatchDetails'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { inBrasilia, isFinished, isLive, sortFixtures } from '../lib/match'
import { imageSrc } from '../lib/image'
import { getFixtureIndex, getMatchDetail, getStandings } from '../services/data'
import type { Fixture } from '../types/football'

export function MatchPage() {
  const { id } = useParams()
  const detailRequest = useCallback(() => id ? getMatchDetail(Number(id)) : Promise.resolve(null), [id])
  const standingsRequest = useCallback(() => getStandings(), [])
  const { data } = useData(getFixtureIndex)
  const { data: detail } = useData(detailRequest)
  const { data: standings } = useData(standingsRequest)
  if (!data) return <section className="skeletons"><div /><div /></section>
  const fixture = data.fixtures.find(item => item.id === Number(id))
  if (!fixture) return <><PageHeader title="Partida" back /><EmptyData title="Partida não disponível" text="Os detalhes podem estar fora do último snapshot publicado." /></>
  const score = fixture.score ? `${fixture.score.home} × ${fixture.score.away}` : inBrasilia(fixture.startsAt)
  const status = isLive(fixture.status) ? `AO VIVO${fixture.elapsed ? ` · ${fixture.elapsed}'` : ''}` : isFinished(fixture.status) ? 'ENCERRADO' : 'AGENDADO'
  const table = standings?.standings.find(item => item.league.id === fixture.league.id)
  return <main><PageHeader title={fixture.league.name} back /><section className="match-hero"><p className={isLive(fixture.status) ? 'live status' : 'status'}>{status}</p><div className="match-hero-teams"><Team name={fixture.home.name} logo={fixture.home.logo} /><strong>{score}</strong><Team name={fixture.away.name} logo={fixture.away.logo} /></div><div className="match-info"><span><Clock3 size={15} /> {inBrasilia(fixture.startsAt)} · Horário de Brasília</span>{fixture.venue && <span><MapPin size={15} /> {fixture.venue}</span>}</div></section><DetailSection title="Onde assistir"><p><Radio size={16} /> Informação de transmissão não disponível.</p></DetailSection><DetailSection title="Escalações">{detail?.lineups ? <Lineups lineups={detail.lineups} /> : <p>Escalação ainda não divulgada.</p>}</DetailSection>{detail?.statistics && <DetailSection title="Estatísticas"><Statistics detail={detail} /></DetailSection>}{<DetailSection title="Forma recente"><Form fixture={fixture} fixtures={data.fixtures} /></DetailSection>}{table && <DetailSection title="Classificação"><MatchTable fixture={fixture} rows={table.rows} /></DetailSection>}{detail?.h2h && <DetailSection title="Confrontos anteriores"><H2H fixtures={detail.h2h} /></DetailSection>}{detail?.events && <DetailSection title="Eventos"><Events detail={detail} /></DetailSection>}</main>
}
function Team({ name, logo }: { name: string; logo?: string }) { return <div>{logo && <img src={imageSrc(logo)} alt="" />}<span>{name}</span></div> }
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="detail-section"><h2>{title}</h2>{children}</section> }
function Form({ fixture, fixtures }: { fixture: Fixture; fixtures: Fixture[] }) { const form = (teamId: number) => sortFixtures(fixtures).filter(item => item.id !== fixture.id && isFinished(item.status) && (item.home.id === teamId || item.away.id === teamId) && item.score).slice(-5).reverse().map(item => { const own = item.home.id === teamId ? item.score!.home : item.score!.away; const other = item.home.id === teamId ? item.score!.away : item.score!.home; return own > other ? 'V' : own < other ? 'D' : 'E' }); const home = form(fixture.home.id); const away = form(fixture.away.id); if (!home.length && !away.length) return <p>Forma recente não disponível.</p>; return <div className="form-rows"><span>{fixture.home.name}<b>{home.map((result, index) => <i key={index} className={`form-${result}`} aria-label={result === 'V' ? 'Vitória' : result === 'E' ? 'Empate' : 'Derrota'}>{result}</i>)}</b></span><span>{fixture.away.name}<b>{away.map((result, index) => <i key={index} className={`form-${result}`} aria-label={result === 'V' ? 'Vitória' : result === 'E' ? 'Empate' : 'Derrota'}>{result}</i>)}</b></span></div> }
function MatchTable({ fixture, rows }: { fixture: Fixture; rows: Array<{ rank: number; team: { id: number; name: string }; points: number; played: number }> }) { const teams = rows.filter(row => row.team.id === fixture.home.id || row.team.id === fixture.away.id); return <div className="match-table">{teams.map(row => <span key={row.team.id}><b>{row.rank}º</b>{row.team.name}<i>{row.played} J · {row.points} P</i></span>)}</div> }
