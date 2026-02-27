import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PATCH } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('User profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)

    const res = await GET()

    expect(res.status).toBe(401)
  })

  it('returns profile with image on GET', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1' } })
    ;((prisma as any).user.findUnique as any).mockResolvedValue({
      id: 'u1',
      name: 'Toni',
      email: 'toni@example.com',
      image: 'data:image/png;base64,abc123',
    })

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.image).toBe('data:image/png;base64,abc123')
  })

  it('updates profile image on PATCH', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1' } })
    ;((prisma as any).user.update as any).mockResolvedValue({
      id: 'u1',
      name: 'Updated Name',
      email: 'toni@example.com',
      image: 'data:image/png;base64,abcd',
    })

    const req = new Request('http://localhost/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Updated Name',
        image: 'data:image/png;base64,abcd',
      }),
    })

    const res = await PATCH(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.image).toBe('data:image/png;base64,abcd')
    expect((prisma as any).user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          image: 'data:image/png;base64,abcd',
        }),
      })
    )
  })

  it('rejects invalid image mime type on PATCH', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1' } })

    const req = new Request('http://localhost/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        image: 'data:text/plain;base64,abcd',
      }),
    })

    const res = await PATCH(req)

    expect(res.status).toBe(400)
  })

  it('allows removing profile image with null', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1' } })
    ;((prisma as any).user.update as any).mockResolvedValue({
      id: 'u1',
      name: 'Toni',
      email: 'toni@example.com',
      image: null,
    })

    const req = new Request('http://localhost/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ image: null }),
    })

    const res = await PATCH(req)

    expect(res.status).toBe(200)
    expect((prisma as any).user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          image: null,
        }),
      })
    )
  })
})
