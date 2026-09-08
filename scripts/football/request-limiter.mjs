export function createRequestLimiter({ minimumIntervalMs, now = () => Date.now(), sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)) }) {
  let queue = Promise.resolve()
  let nextAvailableAt = 0
  return () => {
    const request = queue.then(async () => {
      const wait = Math.max(0, nextAvailableAt - now())
      if (wait) await sleep(wait)
      nextAvailableAt = now() + minimumIntervalMs
    })
    // Keep later requests usable even if an injected clock or sleeper fails.
    queue = request.catch(() => {})
    return request
  }
}
