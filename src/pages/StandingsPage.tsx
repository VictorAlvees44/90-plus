import { useCallback, useState } from 'react'
import { EmptyData } from '../components/EmptyData'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { getStandings } from '../services/data'

export function StandingsPage() {
  const request = useCallback(() => getStandings(), [])
  const { data } = useData(request)
  const [selected, setSelected] = useState(0)
  if (!data) return <main><PageHeader title="Tabelas" /><section className="skeletons"><div /><div /></section></main>
  if (data.standings.length === 0) return <main><PageHeader title="Tabelas" /><EmptyData title="Classificação não disponível" text="Ela será publicada quando a competição oferecer cobertura pela API-Football." /></main>
  const standing = data.standings[selected]
  return <main><PageHeader title="Tabelas" /><div className="league-tabs" role="tablist">{data.standings.map((item, index) => <button role="tab" aria-selected={index === selected} className={index === selected ? 'selected' : ''} key={item.league.id} onClick={() => setSelected(index)}>{item.league.name}</button>)}</div><section className="table-card"><h2>{standing.league.name}</h2><div className="standing-head"><span># Clube</span><span>J V E D GP GC SG P</span></div>{standing.rows.map(row => <div className="standing-row" key={row.team.id}><span><b>{row.rank}</b>{row.team.logo && <img src={row.team.logo} alt="" />}{row.team.name}</span><span>{row.played} {row.win} {row.draw} {row.lose} {row.goalsFor} {row.goalsAgainst} {row.goalDiff} <strong>{row.points}</strong></span></div>)}</section></main>
}
