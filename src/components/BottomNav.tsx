import { CalendarDays, Search, Settings, Table2, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [{ to: '/', label: 'Jogos', icon: CalendarDays }, { to: '/tabelas', label: 'Tabelas', icon: Table2 }, { to: '/buscar', label: 'Buscar', icon: Search }, { to: '/jogadores', label: 'Jogadores', icon: UserRound }, { to: '/configuracoes', label: 'Configurações', icon: Settings }]
export function BottomNav() { return <nav className="bottom-nav" aria-label="Navegação principal">{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={20} /><span>{label}</span></NavLink>)}</nav> }
