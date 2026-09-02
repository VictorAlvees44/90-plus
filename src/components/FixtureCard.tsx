import { Clock3, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { inBrasilia, isFinished, isLive } from '../lib/match'
import type { Fixture } from '../types/football'

export function FixtureCard({ fixture, favoriteTeamId }: { fixture: Fixture; favoriteTeamId?: number }) {
  const reduced = useReducedMotion()
  const live = isLive(fixture.status)
  const finished = isFinished(fixture.status)
  const score = fixture.score ? `${fixture.score.home} × ${fixture.score.away}` : '×'
  const isFavoriteFixture = favoriteTeamId === fixture.home.id || favoriteTeamId === fixture.away.id
  return <motion.article initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={isFavoriteFixture ? 'fixture-card favorite-fixture' : 'fixture-card'}><Link className="fixture-link" to={`/partidas/${fixture.id}`} aria-label={`Abrir detalhes de ${fixture.home.name} contra ${fixture.away.name}`}>
    <p className="league">{fixture.league.name}</p>
    {isFavoriteFixture && <span className="favorite-badge">SEU TIME</span>}
    {live && <span className="live" aria-label="Jogo ao vivo">AO VIVO {fixture.elapsed ? `${fixture.elapsed}'` : ''}</span>}
    <div className="matchup">
      <div className="team team-home">{fixture.home.logo && <img src={fixture.home.logo} alt="" />}<span>{fixture.home.name}</span></div>
      <strong className={finished || live ? 'score' : 'versus'}>{score}</strong>
      <div className="team team-away"><span>{fixture.away.name}</span>{fixture.away.logo && <img src={fixture.away.logo} alt="" />}</div>
    </div>
    <div className="fixture-meta"><span><Clock3 size={14} /> {inBrasilia(fixture.startsAt)}</span>{fixture.venue && <span><MapPin size={14} /> {fixture.venue}</span>}</div>
  </Link></motion.article>
}
