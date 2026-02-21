import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SignUpForm from './SignUpForm'

// Mock fetch
global.fetch = vi.fn()

describe('SignUpForm Component', () => {
    it('should render business fields by default', () => {
        render(<SignUpForm />)
        expect(screen.getByLabelText(/Business Name/i)).toBeDefined()
        expect(screen.getByLabelText(/Business Type/i)).toBeDefined()
    })

    it('should hide business fields when switching to customer', () => {
        render(<SignUpForm />)

        const customerButton = screen.getByText('Customer')
        fireEvent.click(customerButton)

        expect(screen.queryByLabelText(/Business Name/i)).toBeNull()
        expect(screen.queryByLabelText(/Business Type/i)).toBeNull()
    })

    it('should show business fields when switching back to business', () => {
        render(<SignUpForm initialType="customer" />)
        expect(screen.queryByLabelText(/Business Name/i)).toBeNull()

        const businessButton = screen.getByText('Business')
        fireEvent.click(businessButton)

        expect(screen.getByLabelText(/Business Name/i)).toBeDefined()
    })

    it('should show validation errors on submit', async () => {
        render(<SignUpForm />)

        // Submit the form directly
        const form = screen.getByTestId('signup-form')
        fireEvent.submit(form)

        // Wait for validation errors to appear
        expect(await screen.findByText(/Business name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
    })
})
