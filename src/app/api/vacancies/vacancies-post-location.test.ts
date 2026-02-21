import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    business: { findUnique: vi.fn() },
    vacancy: { create: vi.fn() },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('POST /api/vacancies (location required)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 with LOCATION_REQUIRED when business has no latitude', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1', businessId: 'b1' },
    })
    ;(prisma.business.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'b1',
      latitude: null,
      longitude: 13.405,
    })

    const req = new Request('http://localhost/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: '2025-03-01T10:00:00Z',
        duration: 60,
        serviceType: 'Haircut',
        price: 60,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.code).toBe('LOCATION_REQUIRED')
    expect(data.error).toContain('location')
    expect(prisma.vacancy.create).not.toHaveBeenCalled()
  })

  it('returns 400 with LOCATION_REQUIRED when business has no longitude', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1', businessId: 'b1' },
    })
    ;(prisma.business.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'b1',
      latitude: 52.52,
      longitude: null,
    })

    const req = new Request('http://localhost/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: '2025-03-01T10:00:00Z',
        duration: 60,
        serviceType: 'Haircut',
        price: 60,
      }),
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.code).toBe('LOCATION_REQUIRED')
    expect(prisma.vacancy.create).not.toHaveBeenCalled()
  })

  it('creates vacancy when business has location set', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: 'u1', businessId: 'b1' },
    })
    ;(prisma.business.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'b1',
      latitude: 52.52,
      longitude: 13.405,
    })
    ;(prisma.vacancy.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'v1',
      businessId: 'b1',
      startTime: new Date(),
      duration: 60,
      serviceType: 'Haircut',
      priceCents: 6000,
      status: 'ACTIVE',
    })

    const req = new Request('http://localhost/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startTime: '2025-03-01T10:00:00Z',
        duration: 60,
        serviceType: 'Haircut',
        price: 60,
      }),
    })
    const res = await POST(req)

    expect(res.status).toBe(201)
    expect(prisma.vacancy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          priceCents: 6000,
        }),
      })
    )
  })
})
