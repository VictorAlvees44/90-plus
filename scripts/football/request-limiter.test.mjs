import { describe, expect, it, vi } from 'vitest'
import { createRequestLimiter } from './request-limiter.mjs'

describe('limite de requisições', () => {
  it('serializa chamadas e respeita o intervalo mínimo', async () => {
    let time = 0
    const sleep = vi.fn(async milliseconds => { time += milliseconds })
    const next = createRequestLimiter({ minimumIntervalMs: 7_500, now: () => time, sleep })
    await Promise.all([next(), next(), next()])
    expect(sleep).toHaveBeenNthCalledWith(1, 7_500)
    expect(sleep).toHaveBeenNthCalledWith(2, 7_500)
  })
})
