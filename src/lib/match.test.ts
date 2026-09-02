import { describe, expect, it } from 'vitest'
import { addCalendarDays, dateInBrasilia, inBrasilia, isFinished, isLive, sortFixtures } from './match'

describe('regras de jogo', () => {
  it('separa status ao vivo e encerrados', () => { expect(isLive('live')).toBe(true); expect(isLive('finished')).toBe(false); expect(isFinished('after_penalties')).toBe(true) })
  it('ordena pelo horário oficial', () => { const result = sortFixtures([{ id: 2, startsAt: '2026-08-28T21:00:00Z' }, { id: 1, startsAt: '2026-08-28T18:00:00Z' }] as never); expect(result.map(x => x.id)).toEqual([1, 2]) })
  it('mostra o horário em Brasília', () => { expect(inBrasilia('2026-08-28T18:00:00Z')).toBe('15:00') })
  it('agrupa uma partida pela data de Brasília', () => { expect(dateInBrasilia('2026-08-29T02:30:00Z')).toBe('2026-08-28'); expect(addCalendarDays('2026-08-28', -1)).toBe('2026-08-27') })
})
