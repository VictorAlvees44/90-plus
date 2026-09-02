import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { ClubPage } from './pages/ClubPage'
import { MatchPage } from './pages/MatchPage'
import { PeoplePage } from './pages/PeoplePage'
import { PlayerPage } from './pages/PlayerPage'
import { SearchPage } from './pages/SearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { StandingsPage } from './pages/StandingsPage'

export function App() { return <BrowserRouter basename={import.meta.env.BASE_URL}><div className="app-shell"><Routes><Route path="/" element={<HomePage />} /><Route path="/partidas/:id" element={<MatchPage />} /><Route path="/clubes/:id" element={<ClubPage />} /><Route path="/tabelas" element={<StandingsPage />} /><Route path="/buscar" element={<SearchPage />} /><Route path="/jogadores" element={<PeoplePage />} /><Route path="/jogadores/:id" element={<PlayerPage />} /><Route path="/configuracoes" element={<SettingsPage />} /></Routes><BottomNav /></div></BrowserRouter> }
