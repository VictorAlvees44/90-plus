import type { Fixture, MatchStatus } from '../types/football'

export const isLive = (status: MatchStatus) => status === 'live' || status === 'halftime'
export const isFinished = (status: MatchStatus) => ['finished', 'after_extra_time', 'after_penalties'].includes(status)
export const inBrasilia = (iso: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
export const dateInBrasilia = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso))
  const values = Object.fromEntries(parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}
export const addCalendarDays = (date: string, days: number) => { const value = new Date(`${date}T12:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10) }
export const sortFixtures = (fixtures: Fixture[]) => [...fixtures].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
