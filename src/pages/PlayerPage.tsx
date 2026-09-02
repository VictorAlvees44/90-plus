import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyData } from '../components/EmptyData'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { getPlayerProfile } from '../services/data'

export function PlayerPage() {
  const { id } = useParams()
  const request = useCallback(() => id ? getPlayerProfile(Number(id)) : Promise.resolve(null), [id])
  const { data: profile, loading } = useData(request)
  if (loading) return <main><PageHeader title="Jogador" back /><section className="skeletons"><div /><div /></section></main>
  if (!profile) return <main><PageHeader title="Jogador" back /><EmptyData title="Jogador não disponível" text="Perfis são publicados apenas quando os dados do jogador estiverem disponíveis na API-Football." /></main>
  const fields = [{ label: 'Idade', value: profile.player.age }, { label: 'Número', value: profile.player.number }, { label: 'Posição', value: profile.player.position }, { label: 'Nacionalidade', value: profile.player.nationality }].filter(field => field.value !== undefined)
  const transfers = profile.transfers?.filter(transfer => transfer.from || transfer.to) ?? []
  return <main><PageHeader title="Jogador" back /><section className="player-hero">{profile.player.photo && <img src={profile.player.photo} alt="" />}<h1>{profile.player.name}</h1><Link to={`/clubes/${profile.team.id}`}>{profile.team.logo && <img src={profile.team.logo} alt="" />}{profile.team.name}</Link></section>{fields.length > 0 && <section className="info-panel"><h2>PERFIL</h2><div className="number-grid">{fields.map(field => <span key={field.label}><b>{field.value}</b>{field.label}</span>)}</div></section>}{profile.statistics?.length ? <section className="detail-section"><h2>ESTATÍSTICAS</h2><div className="player-stat-list">{profile.statistics.map(stat => <div key={stat.league}><b>{stat.league}</b><span>{formatStats(stat)}</span></div>)}</div></section> : null}{transfers.length ? <section className="detail-section"><h2>CARREIRA</h2><ol className="career-list">{transfers.map((transfer, index) => <li key={`${transfer.date ?? ''}-${index}`}><b>{transfer.date ? new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(new Date(transfer.date)) : '—'}</b><span>{[transfer.from, transfer.to].filter(Boolean).join(' → ')}{transfer.type && <small>{transfer.type}</small>}</span></li>)}</ol></section> : null}{profile.trophies?.length ? <section className="detail-section"><h2>TÍTULOS</h2><div className="trophy-list">{profile.trophies.map((trophy, index) => <span key={`${trophy.league}-${index}`}><b>{trophy.league}</b>{[trophy.season, trophy.place].filter(Boolean).join(' · ')}</span>)}</div></section> : null}</main>
}

function formatStats(stat: { games?: number; minutes?: number; goals?: number; assists?: number; rating?: string; cards?: number }) { return [{ label: 'J', value: stat.games }, { label: 'min', value: stat.minutes }, { label: 'G', value: stat.goals }, { label: 'A', value: stat.assists }, { label: 'nota', value: stat.rating }, { label: 'cartões', value: stat.cards }].filter(item => item.value !== undefined).map(item => `${item.value} ${item.label}`).join(' · ') }
