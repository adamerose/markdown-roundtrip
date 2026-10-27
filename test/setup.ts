import { beforeEach } from 'vitest'

// Vitest runs synchronous tests back to back without returning to the event loop, so after a
// minute of them its worker misses its own RPC replies ("Timeout calling onTaskUpdate").
beforeEach(() => new Promise((resolve) => setTimeout(resolve)))
