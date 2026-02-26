import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET, PATCH } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    customerSettings: {
      upsert: vi.fn(),
    },
  },
}))

describe('Customer settings API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 403 for business users', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'BUSINESS' } })
    const res = await GET()
    expect(res.status).toBe(403)
  })

  it('returns normalized settings from GET', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'CUSTOMER' } })
    ;((prisma as any).customerSettings.upsert as any).mockResolvedValue({
      notifyBookingReminders: true,
      notifyCancellationAlerts: true,
      notifyMarketing: false,
      defaultMaxDistanceKm: 10,
      defaultServiceType: null,
      homeAddress: null,
      shareLocationOnSearch: false,
    })

    const res = await GET()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.defaultServiceType).toBe('')
    expect(data.homeAddress).toBe('')
  })

  it('validates max distance in PATCH', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'CUSTOMER' } })
    const req = new Request('http://localhost/api/user/customer-settings', {
      method: 'PATCH',
      body: JSON.stringify({ defaultMaxDistanceKm: 0 }),
    })
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })
})
