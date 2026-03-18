import { describe, it } from 'vitest'

describe('Admin Server Actions', () => {
  describe('createBannedItem', () => {
    it.todo('rejects non-admin user with Forbidden error')
    it.todo('creates item and logs audit for authorized admin')
  })
  describe('banPlayer', () => {
    it.todo('sets banned=1 on arena_players for given uuid')
    it.todo('rejects non-admin user with Forbidden error')
  })
})
