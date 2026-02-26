import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE } from './route'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn(),
  },
}))

describe('Customer account API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const res = await DELETE()
    expect(res.status).toBe(401)
  })

  it('returns 403 for business users', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'BUSINESS' } })
    const res = await DELETE()
    expect(res.status).toBe(403)
  })

  it('deletes customer account in transaction', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: 'u1', role: 'CUSTOMER' } })

    const mockTx = {
      vacancy: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      customerSettings: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      user: { delete: vi.fn().mockResolvedValue({ id: 'u1' }) },
    }
    ;(prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx))

    const res = await DELETE()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockTx.vacancy.updateMany).toHaveBeenCalled()
    expect(mockTx.customerSettings.deleteMany).toHaveBeenCalled()
    expect(mockTx.user.delete).toHaveBeenCalled()
  })
})
