import { useCallback, useEffect, useMemo, useState } from 'react'
import { Database, Download, Heart, ShieldCheck, Trash2, WifiOff } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useData } from '../hooks/useData'
import { getDataMeta, getSearchIndex } from '../services/data'
import { getFavoriteTeam, setFavoriteTeam } from '../services/preferences'

export function SettingsPage() {
  const metadataRequest = useCallback(() => getDataMeta(), [])
  const searchRequest = useCallback(() => getSearchIndex(), [])
  const { data: metadata } = useData(metadataRequest)
  const { data: search, loading: loadingTeams } = useData(searchRequest)
  const [offline, setOffline] = useState(() => !navigator.onLine)
  const [favorite, setFavorite] = useState(getFavoriteTeam)
  const [installed] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  const [cacheStatus, setCacheStatus] = useState(() => 'caches' in window ? 'Verificando cache…' : 'Cache não disponível neste navegador.')
  const teams = useMemo(() => search?.items.filter(item => item.type === 'team').sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')) ?? [], [search])

  useEffect(() => {
    const setOnline = () => setOffline(false)
    const setOfflineState = () => setOffline(true)
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOfflineState)
    return () => { window.removeEventListener('online', setOnline); window.removeEventListener('offline', setOfflineState) }
  }, [])
  useEffect(() => {
    if (!('caches' in window)) return
    void caches.keys().then(keys => setCacheStatus(keys.length ? `${keys.length} cache(s) ativo(s).` : 'Nenhum cache salvo ainda.')).catch(() => setCacheStatus('Não foi possível consultar o cache.'))
  }, [])

  const chooseTeam = (id: number) => {
    const team = teams.find(item => item.id === id)
    if (!team) return
    const next = { id: team.id, name: team.label, ...(team.image ? { logo: team.image } : {}) }
    setFavoriteTeam(next)
    setFavorite(next)
  }
  const clearFavorite = () => { setFavoriteTeam(null); setFavorite(null) }
  const updated = metadata?.lastSuccessAt ? relativeTime(metadata.lastSuccessAt) : 'ainda não atualizados'

  return <main><PageHeader title="Configurações" back /><section className="settings-group"><h2><Heart size={15} /> MEU TIME</h2><p>Escolha um clube ou seleção para destacar os seus jogos neste aparelho.</p><label className="team-select"><Heart size={16} /><select value={favorite?.id ?? ''} onChange={event => chooseTeam(Number(event.target.value))} disabled={loadingTeams || teams.length === 0} aria-label="Escolher meu time"><option value="">{loadingTeams ? 'Carregando times…' : teams.length ? 'Selecione um time' : 'Times indisponíveis no momento'}</option>{teams.map(team => <option key={team.id} value={team.id}>{team.label}</option>)}</select></label>{favorite && <button className="clear-favorite" onClick={clearFavorite}><Trash2 size={14} /> Remover {favorite.name}</button>}</section><section className="settings-group"><h2><Database size={15} /> DADOS E APLICATIVO</h2><p><Download size={15} /> Dados {updated}.</p><p><ShieldCheck size={15} /> {installed ? 'Aplicativo instalado neste dispositivo.' : 'Abra pelo navegador ou instale pelo menu do navegador.'}</p><p><ShieldCheck size={15} /> {cacheStatus}</p>{metadata?.quota?.used !== undefined && <p><Database size={15} /> Coleta mais recente: {metadata.quota.used}/{metadata.quota.limit ?? 100} chamadas.</p>}{offline && <p className="offline"><WifiOff size={15} /> Você está offline. Conteúdo salvo continua acessível.</p>}</section><p className="copyright">90+ · Dados oficiais conforme cobertura disponível da API-Football.</p></main>
}

function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'atualizados agora'
  if (seconds < 3600) return `atualizados há ${Math.floor(seconds / 60)} min`
  if (seconds < 86400) return `atualizados há ${Math.floor(seconds / 3600)} h`
  return `atualizados em ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value))}`
}
