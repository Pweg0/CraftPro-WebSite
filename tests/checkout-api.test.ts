// tests/checkout-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

// Mock db schema
vi.mock('@/lib/db/schema', () => ({
  shopItems: 'shopItems',
  orders: 'orders',
}))

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
  and: vi.fn((...args) => ({ type: 'and', args })),
}))

// Mock mercadopago (will throw if not installed in some tests)
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn().mockImplementation(() => ({})),
  Preference: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({
      id: 'test-preference-id',
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=test-preference-id',
    }),
  })),
  Payment: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue({
      id: 12345,
      status: 'approved',
      external_reference: '42',
    }),
  })),
}))

describe('POST /api/loja/checkout', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth')
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const { POST } = await import('@/app/api/loja/checkout/route')

    const req = new Request('http://localhost/api/loja/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 1 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)

    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it('returns 400 when itemId is missing', async () => {
    const { auth } = await import('@/lib/auth')
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-123' },
    })

    const { POST } = await import('@/app/api/loja/checkout/route')

    const req = new Request('http://localhost/api/loja/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it('returns 400 when itemId is not a number', async () => {
    const { auth } = await import('@/lib/auth')
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-123' },
    })

    const { POST } = await import('@/app/api/loja/checkout/route')

    const req = new Request('http://localhost/api/loja/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 'not-a-number' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when item not found or not available', async () => {
    const { auth } = await import('@/lib/auth')
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-123' },
    })

    const { db } = await import('@/lib/db')
    // Simulate db.select().from().where().limit() chain returning empty
    const limitMock = vi.fn().mockResolvedValue([])
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
    const fromMock = vi.fn().mockReturnValue({ where: whereMock })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromMock })

    const { POST } = await import('@/app/api/loja/checkout/route')

    const req = new Request('http://localhost/api/loja/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 999 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('returns 503 when MP_ACCESS_TOKEN is not configured', async () => {
    const { auth } = await import('@/lib/auth')
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'user-123' },
    })

    const { db } = await import('@/lib/db')
    const item = { id: 1, name: 'Test Item', description: 'Desc', category: 'cosmeticos', price: 1990, available: 1 }
    const limitMock = vi.fn().mockResolvedValue([item])
    const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
    const fromMock = vi.fn().mockReturnValue({ where: whereMock })
    ;(db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from: fromMock })

    // Ensure MP_ACCESS_TOKEN is not set
    const originalToken = process.env.MP_ACCESS_TOKEN
    delete process.env.MP_ACCESS_TOKEN

    const { POST } = await import('@/app/api/loja/checkout/route')

    const req = new Request('http://localhost/api/loja/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: 1 }),
    })

    const res = await POST(req)
    expect(res.status).toBe(503)

    // Restore
    if (originalToken) process.env.MP_ACCESS_TOKEN = originalToken
  })
})

describe('POST /api/loja/webhook', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 200 and handled:true for payment notification', async () => {
    const { db } = await import('@/lib/db')
    const setMock = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) })
    ;(db.update as ReturnType<typeof vi.fn>).mockReturnValue({ set: setMock })

    // Set up MP token
    process.env.MP_ACCESS_TOKEN = 'TEST_TOKEN'

    const { POST } = await import('@/app/api/loja/webhook/route')

    const req = new Request('http://localhost/api/loja/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment',
        data: { id: '12345' },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.received).toBe(true)
  })

  it('returns 200 with skipped:true for non-payment notification types', async () => {
    const { POST } = await import('@/app/api/loja/webhook/route')

    const req = new Request('http://localhost/api/loja/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'subscription_preapproval',
        data: { id: '999' },
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.received).toBe(true)
    expect(data.skipped).toBe(true)
  })

  it('returns 400 for invalid JSON body', async () => {
    const { POST } = await import('@/app/api/loja/webhook/route')

    const req = new Request('http://localhost/api/loja/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('GET /api/loja/webhook returns 200 (MP verification)', async () => {
    const { GET } = await import('@/app/api/loja/webhook/route')

    const req = new Request('http://localhost/api/loja/webhook', {
      method: 'GET',
    })

    const res = await GET()
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.ok).toBe(true)
  })
})
