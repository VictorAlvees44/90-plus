import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { FixtureCard } from '../components/FixtureCard'
import { useFixtures } from '../hooks/useFixtures'
import { addCalendarDays, dateInBrasilia, isFinished, isLive, sortFixtures } from '../lib/match'
import { getFavoriteTeam } from '../services/preferences'

export function HomePage() {
  const { data, error, reload } = useFixtures()
  const favoriteTeam = getFavoriteTeam()
  const today = dateInBrasilia(new Date().toISOString())
  const [selectedDate, setSelectedDate] = useState(today)
  // Today stays first on narrow screens; the complete 7-day past/future window remains scrollable.
  const dates = useMemo(() => [today, ...Array.from({ length: 7 }, (_, index) => addCalendarDays(today, index + 1)), ...Array.from({ length: 7 }, (_, index) => addCalendarDays(today, -index - 1))], [today])
  const groups = useMemo(() => { const fixtures = sortFixtures((data?.fixtures ?? []).filter(fixture => dateInBrasilia(fixture.startsAt) === selectedDate)); return { live: fixtures.filter(x => isLive(x.status)), upcoming: fixtures.filter(x => !isLive(x.status) && !isFinished(x.status)), finished: fixtures.filter(x => isFinished(x.status)) } }, [data, selectedDate])
  if (error) return <section className="empty-state"><h1>Não conseguimos atualizar os jogos.</h1><button onClick={reload}><RefreshCw size={16} /> Tentar novamente</button></section>
  if (!data) return <section className="skeletons" aria-label="Carregando jogos"><div /><div /><div /></section>
  return <>
    <header className="home-header"><img src={`${import.meta.env.BASE_URL}assets/logos/90plus-header-logo-dark.png`} alt="90+" /><p>JOGOS</p></header>
    <div className="date-strip" aria-label="Selecionar data">{dates.map(date => <button key={date} onClick={() => setSelectedDate(date)} className={date === selectedDate ? 'selected' : ''} aria-label={new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00Z`))}><span>{date === today ? 'HOJE' : new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(`${date}T12:00:00Z`)).replace('.', '').toUpperCase()}</span><b>{date.slice(-2)}</b></button>)}</div>
    <main>{favoriteTeam && <FavoriteTeamSection teamId={favoriteTeam.id} teamName={favoriteTeam.name} fixtures={sortFixtures(data.fixtures)} />}{groups.live.length > 0 && <FixtureSection title="AO VIVO" fixtures={groups.live} favoriteTeamId={favoriteTeam?.id} />}{groups.upcoming.length > 0 && <FixtureSection title="PRÓXIMOS JOGOS" fixtures={groups.upcoming} favoriteTeamId={favoriteTeam?.id} />}{groups.finished.length > 0 && <FixtureSection title="JOGOS ENCERRADOS DE HOJE" fixtures={groups.finished} favoriteTeamId={favoriteTeam?.id} />}{groups.live.length + groups.upcoming.length + groups.finished.length === 0 && <section className="empty-state"><h1>Nenhum jogo encontrado</h1><p>Não há partidas disponíveis para esta data.</p>{data.updatedAt && <small>Última atualização: {new Date(data.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</small>}</section>}</main>
  </>
}
function FixtureSection({ title, fixtures, favoriteTeamId }: { title: string; fixtures: ReturnType<typeof sortFixtures>; favoriteTeamId?: number }) { return <section className="fixture-section"><h2>{title}</h2>{fixtures.map(fixture => <FixtureCard key={fixture.id} fixture={fixture} favoriteTeamId={favoriteTeamId} />)}</section> }
function FavoriteTeamSection({ teamId, teamName, fixtures }: { teamId: number; teamName: string; fixtures: ReturnType<typeof sortFixtures> }) { const ownFixtures = fixtures.filter(fixture => fixture.home.id === teamId || fixture.away.id === teamId); if (!ownFixtures.length) return null; const upcoming = ownFixtures.find(fixture => !isFinished(fixture.status)); const recent = ownFixtures.filter(fixture => isFinished(fixture.status)).at(-1); const highlights = [...new Map([upcoming, recent].filter(Boolean).map(fixture => [fixture!.id, fixture!])).values()]; return <FixtureSection title={`MEU TIME · ${teamName.toUpperCase()}`} fixtures={highlights} favoriteTeamId={teamId} /> }
