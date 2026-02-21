import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authorizeUser } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
        },
    },
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
    },
}))

describe('Authentication Logic (authorizeUser)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fail if email or password missing', async () => {
        const promise = authorizeUser({ email: '', password: '' });
        await expect(promise).rejects.toThrow('Please enter an email and password')
    })

    it('should fail if user not found', async () => {
        ; (prisma.user.findUnique as any).mockResolvedValue(null)
        const promise = authorizeUser({ email: 'test@example.com', password: 'password' });
        await expect(promise).rejects.toThrow('No user found with this email')
    })

    it('should fail if password incorrect', async () => {
        ; (prisma.user.findUnique as any).mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            password: 'hashed_password'
        })
            ; (bcrypt.compare as any).mockResolvedValue(false)
        const promise = authorizeUser({ email: 'test@example.com', password: 'wrong' });
        await expect(promise).rejects.toThrow('Incorrect password')
    })

    it('should succeed if everything matches (no userType)', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            password: 'hashed_password',
            role: 'CUSTOMER',
            businessId: null,
            business: null
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const result = await authorizeUser({ email: 'test@example.com', password: 'password' })
        console.log('Result (no userType):', JSON.stringify(result));
        expect(result).not.toBeNull()
        expect(result.id).toBe('1')
        expect(result.role).toBe('CUSTOMER')
    })

    it('should fail if customer tries to log in as business', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            password: 'hashed_password',
            role: 'CUSTOMER',
            businessId: null,
            business: null
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const promise = authorizeUser({
            email: 'test@example.com',
            password: 'password',
            userType: 'business'
        });
        await expect(promise).rejects.toThrow('This account is not registered as a business account')
    })

    it('should fail if business tries to log in as customer', async () => {
        const mockUser = {
            id: '2',
            email: 'biz@example.com',
            password: 'hashed_password',
            role: 'BUSINESS',
            businessId: 'bus_1',
            business: { name: 'My Biz' }
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const promise = authorizeUser({
            email: 'biz@example.com',
            password: 'password',
            userType: 'customer'
        });
        await expect(promise).rejects.toThrow('This account is not registered as a customer account')
    })

    it('should succeed if roles match', async () => {
        const mockUser = {
            id: '2',
            email: 'biz@example.com',
            password: 'hashed_password',
            role: 'BUSINESS',
            businessId: 'bus_1',
            business: { name: 'My Biz' }
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const result = await authorizeUser({
            email: 'biz@example.com',
            password: 'password',
            userType: 'business'
        })
        console.log('Result (roles match):', JSON.stringify(result));
        expect(result.id).toBe('2')
        expect(result.role).toBe('BUSINESS')
    })

    it('should skip role check if userType is empty string', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            password: 'hashed_password',
            role: 'BUSINESS',
            businessId: 'bus_1',
            business: null
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const result = await authorizeUser({
            email: 'test@example.com',
            password: 'password',
            userType: ''
        })
        expect(result.id).toBe('1')
        expect(result.role).toBe('BUSINESS')
    })

    it('should succeed for USER role in business context', async () => {
        const mockUser = {
            id: '3',
            email: 'legacy@example.com',
            password: 'hashed_password',
            role: 'USER',
            businessId: null,
            business: null
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const result = await authorizeUser({
            email: 'legacy@example.com',
            password: 'password',
            userType: 'business'
        })
        expect(result.id).toBe('3')
        expect(result.role).toBe('USER')
    })

    it('should succeed for USER role in customer context', async () => {
        const mockUser = {
            id: '3',
            email: 'legacy@example.com',
            password: 'hashed_password',
            role: 'USER',
            businessId: null,
            business: null
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)
            ; (bcrypt.compare as any).mockResolvedValue(true)

        const result = await authorizeUser({
            email: 'legacy@example.com',
            password: 'password',
            userType: 'customer'
        })
        expect(result.id).toBe('3')
        expect(result.role).toBe('USER')
    })
})
