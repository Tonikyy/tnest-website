'use client'

import { useState } from 'react'

interface SignUpFormProps {
  initialType?: 'business' | 'customer'
}

export default function SignUpForm({ initialType = 'business' }: SignUpFormProps) {
  const [userType, setUserType] = useState<'business' | 'customer'>(initialType)
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: ''
  })

  const [errors, setErrors] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    general: '',
    success: ''
  })

  const validateForm = () => {
    const newErrors = {
      businessName: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessType: '',
      general: '',
      success: ''
    }

    if (userType === 'business' && !formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (userType === 'business' && !formData.businessType) {
      newErrors.businessType = 'Please select a business type'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(userType === 'business' ? {
              businessName: formData.businessName,
              businessType: formData.businessType,
            } : {
              name: formData.name,
            }),
            email: formData.email,
            password: formData.password,
            role: userType === 'business' ? 'BUSINESS' : 'CUSTOMER'
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong')
        }

        setErrors(prev => ({ ...prev, success: 'Account created successfully! You can now sign in.' }))
        // Optionally redirect to login after a delay
        setTimeout(() => {
          window.location.href = `/login?type=${userType}`
        }, 2000)
      } catch (error: any) {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Failed to create account. Please try again.'
        }))
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setUserType('business')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'business'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Business
        </button>
        <button
          type="button"
          onClick={() => setUserType('customer')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${userType === 'customer'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Customer
        </button>
      </div>

      <form data-testid="signup-form" className="space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errors.general}</span>
          </div>
        )}

        {errors.success && (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errors.success}</span>
          </div>
        )}

        {userType === 'customer' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Toni"
                value={formData.name}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {userType === 'business' && (
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <div className="mt-1">
              <input
                id="business-name"
                name="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${errors.businessName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {userType === 'business' && (
          <div>
            <label htmlFor="business-type" className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <div className="mt-1">
              <select
                id="business-type"
                name="businessType"
                required
                value={formData.businessType}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-2 border ${errors.businessType ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              >
                <option value="">Select a business type</option>
                <option value="salon">Salon</option>
                <option value="spa">Spa</option>
                <option value="medical">Medical Practice</option>
                <option value="fitness">Fitness Center</option>
                <option value="other">Other</option>
              </select>
              {errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create {userType === 'business' ? 'Business' : 'Customer'} Account
          </button>
        </div>
      </form>
    </div>
  )
}
