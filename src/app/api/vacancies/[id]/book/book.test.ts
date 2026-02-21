import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    vacancy: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('POST /api/vacancies/[id]/book', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not logged in', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = new Request('http://localhost/api/vacancies/v1/book', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'v1' }) })

    expect(res.status).toBe(401)
    expect(prisma.vacancy.findUnique).not.toHaveBeenCalled()
  })

  it('returns 404 when vacancy not found', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user1' } })
    ;(prisma.vacancy.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = new Request('http://localhost/api/vacancies/v1/book', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'v1' }) })

    expect(res.status).toBe(404)
  })

  it('returns 400 when vacancy is not ACTIVE', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user1' } })
    ;(prisma.vacancy.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'v1',
      status: 'BOOKED',
    })

    const req = new Request('http://localhost/api/vacancies/v1/book', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'v1' }) })

    expect(res.status).toBe(400)
  })

  it('books vacancy and returns 200', async () => {
    ;(getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user1' } })
    ;(prisma.vacancy.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'v1',
      status: 'ACTIVE',
    })
    ;(prisma.vacancy.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'v1',
      status: 'BOOKED',
      bookedById: 'user1',
      bookedAt: new Date(),
      business: { name: 'Salon', address: '123 St' },
    })

    const req = new Request('http://localhost/api/vacancies/v1/book', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ id: 'v1' }) })
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.status).toBe('BOOKED')
    expect(data.bookedById).toBe('user1')
    expect(prisma.vacancy.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: expect.objectContaining({
        status: 'BOOKED',
        bookedById: 'user1',
      }),
      include: { business: { select: { name: true, address: true } } },
    })
  })
})
