import { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyData } from '../components/EmptyData'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { getSearchIndex } from '../services/data'
import type { SearchItem } from '../types/football'

const filters: Array<{ value: 'all' | SearchItem['type']; label: string }> = [{ value: 'all', label: 'Todos' }, { value: 'team', label: 'Clubes' }, { value: 'player', label: 'Jogadores' }, { value: 'league', label: 'Competições' }]

export function SearchPage() {
  const [term, setTerm] = useState('')
  const [filter, setFilter] = useState<'all' | SearchItem['type']>('all')
  const request = useCallback(() => getSearchIndex(), [])
  const { data } = useData(request)
  const items = useMemo(() => data?.items.filter(item => (filter === 'all' || item.type === filter) && item.label.toLocaleLowerCase('pt-BR').includes(term.toLocaleLowerCase('pt-BR'))) ?? [], [data, term, filter])
  return <main><PageHeader title="Buscar" /><label className="search-box"><Search size={19} /><input value={term} onChange={event => setTerm(event.target.value)} placeholder="Clubes, jogadores e competições" aria-label="Buscar clubes, jogadores e competições" autoComplete="off" /></label><div className="search-filters" role="tablist">{filters.map(item => <button key={item.value} role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>{!data ? <section className="skeletons"><div /></section> : items.length === 0 ? <EmptyData title={term ? 'Nenhum resultado encontrado' : 'Busca pronta'} text={term ? 'Tente outro termo ou filtro.' : 'Os resultados aparecerão após a próxima atualização de dados.'} /> : <section className="search-results">{items.map(item => <Link key={`${item.type}-${item.id}`} to={item.type === 'team' ? `/clubes/${item.id}` : item.type === 'player' ? `/jogadores/${item.id}` : '/tabelas'}>{item.image && <img src={item.image} alt="" />}<span><b>{item.label}</b><small>{item.subtitle}</small></span></Link>)}</section>}</main>
}
