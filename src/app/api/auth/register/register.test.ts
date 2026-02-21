import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        business: {
            create: vi.fn(),
        },
        $transaction: vi.fn((cb) => cb({
            business: { create: vi.fn().mockResolvedValue({ id: 'bus_1' }) },
            user: { create: vi.fn().mockResolvedValue({ id: 'user_1', email: 'test@example.com', role: 'BUSINESS' }) },
        })),
    },
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password'),
    },
}))

describe('Registration API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should register a business user successfully', async () => {
        const payload = {
            email: 'business@example.com',
            password: 'password123',
            role: 'BUSINESS',
            businessName: 'Test Business',
            businessType: 'salon',
        }

        const req = new Request('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

            // Mock no existing user
            ; (prisma.user.findUnique as any).mockResolvedValue(null)

        // Mock transaction success
        const mockTx = {
            business: { create: vi.fn().mockResolvedValue({ id: 'bus_123' }) },
            user: { create: vi.fn().mockResolvedValue({ id: 'user_123', email: payload.email, businessId: 'bus_123', role: 'BUSINESS' }) },
        }
            ; (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx))

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.user.role).toBe('BUSINESS')
        expect(data.user.businessId).toBe('bus_123')
        expect(mockTx.business.create).toHaveBeenCalledWith({
            data: { name: payload.businessName, type: payload.businessType }
        })
    })

    it('should register a customer user successfully without creating a business', async () => {
        const payload = {
            email: 'customer@example.com',
            password: 'password123',
            role: 'CUSTOMER',
        }

        const req = new Request('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

            // Mock no existing user
            ; (prisma.user.findUnique as any).mockResolvedValue(null)

        // Mock transaction success
        const mockTx = {
            business: { create: vi.fn() },
            user: { create: vi.fn().mockResolvedValue({ id: 'user_456', email: payload.email, businessId: null, role: 'CUSTOMER' }) },
        }
            ; (prisma.$transaction as any).mockImplementation(async (cb: any) => cb(mockTx))

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.user.role).toBe('CUSTOMER')
        expect(data.user.businessId).toBeNull()
        expect(mockTx.business.create).not.toHaveBeenCalled()
    })

    it('should return 400 if user already exists', async () => {
        const payload = {
            email: 'existing@example.com',
            password: 'password123',
            role: 'CUSTOMER',
        }

        const req = new Request('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

            // Mock existing user
            ; (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing_id' })

        const response = await POST(req)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('User already exists')
    })

    it('should return 400 if required fields are missing', async () => {
        const payload = {
            email: 'test@example.com',
            // password missing
            role: 'CUSTOMER',
        }

        const req = new Request('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

        const response = await POST(req)
        expect(response.status).toBe(400)
    })
})
