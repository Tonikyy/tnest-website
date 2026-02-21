import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    vacancy: {
      findMany: vi.fn(),
    },
  },
}))

describe('GET /api/vacancies/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only ACTIVE vacancies with business location', async () => {
    const mockVacancies = [
      {
        id: 'v1',
        startTime: new Date('2025-03-01T10:00:00Z'),
        duration: 60,
        serviceType: 'Haircut',
        notes: null,
        status: 'ACTIVE',
        businessId: 'b1',
        bookedById: null,
        bookedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        business: {
          id: 'b1',
          name: 'Salon One',
          type: 'salon',
          address: '123 Main St',
          latitude: 52.52,
          longitude: 13.405,
        },
      },
    ]
    ;(prisma.vacancy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockVacancies)

    const req = new Request('http://localhost/api/vacancies/search?lat=52.52&lng=13.405&maxDistanceKm=10')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('v1')
    expect(data[0].business.name).toBe('Salon One')
    expect(typeof data[0].distanceKm).toBe('number')
    expect(data[0].distanceKm).toBe(0)
  })

  it('filters by maxDistanceKm when provided', async () => {
    const mockVacancies = [
      {
        id: 'v1',
        startTime: new Date(),
        duration: 60,
        serviceType: 'Haircut',
        notes: null,
        status: 'ACTIVE',
        businessId: 'b1',
        bookedById: null,
        bookedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        business: {
          id: 'b1',
          name: 'Far',
          type: 'salon',
          address: null,
          latitude: 53,
          longitude: 14,
        },
      },
    ]
    ;(prisma.vacancy.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockVacancies)

    const req = new Request('http://localhost/api/vacancies/search?lat=52.52&lng=13.405&maxDistanceKm=1')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data).toHaveLength(0)
  })
})
