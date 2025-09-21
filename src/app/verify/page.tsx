'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage(result.message)
      } else {
        setStatus('error')
        setMessage(result.error)
      }
    } catch (error) {
      setStatus('error')
      setMessage('An unexpected error occurred')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-accent-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-forest mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-primary-forest mb-4">Verifying Your Email</h2>
              <p className="text-secondary-gray">Please wait while we verify your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-forest mb-4">Email Verified!</h2>
              <p className="text-secondary-gray mb-6">{message}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium"
              >
                Continue to Login
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
              <p className="text-secondary-gray mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium"
                >
                  Create New Account
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-secondary-gray text-accent-white py-3 px-4 rounded-lg hover:bg-accent-charcoal transition-colors duration-200 font-medium"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-accent-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-forest mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-primary-forest mb-4">Loading...</h2>
          </div>
        </div>
      </main>
    }>
      <VerifyContent />
    </Suspense>
  )
}