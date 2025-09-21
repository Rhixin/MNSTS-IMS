'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline'

export default function AdminVerifyUserPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    action?: string
    user?: string
  } | null>(null)

  const token = searchParams.get('token')
  const action = searchParams.get('action') // 'approve' or 'reject'

  useEffect(() => {
    if (!token || !action) {
      setResult({
        success: false,
        message: 'Invalid verification link'
      })
      setLoading(false)
      return
    }

    // Call the API to handle the verification
    handleVerification()
  }, [token, action])

  const handleVerification = async () => {
    try {
      // Use GET method to avoid authentication issues
      const url = `/api/admin/verify-user?token=${encodeURIComponent(token!)}&action=${encodeURIComponent(action!)}`
      const response = await fetch(url, {
        method: 'GET'
      })

      // If GET method redirects or fails, try POST as fallback
      if (!response.ok) {
        const postResponse = await fetch('/api/admin/verify-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            action
          })
        })

        const data = await postResponse.json()

        if (data.success) {
          setResult({
            success: true,
            message: data.message,
            action: data.data?.action,
            user: data.data?.user
          })
        } else {
          setResult({
            success: false,
            message: data.error || 'Verification failed'
          })
        }
      } else {
        // For GET method, we'll be redirected, so we should check the URL
        // But since this is client-side, let's handle it differently
        setResult({
          success: true,
          message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
          action: action!,
          user: 'User'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setResult({
        success: false,
        message: 'Network error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-accent-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-forest mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-primary-forest mb-2">
                Processing Verification...
              </h1>
              <p className="text-secondary-gray">
                Please wait while we process your request
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!result) {
    return null
  }

  const isApproved = result.action === 'approved'
  const isRejected = result.action === 'rejected'

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-accent-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6">
              {result.success ? (
                isApproved ? (
                  <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
                ) : isRejected ? (
                  <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
                ) : (
                  <CheckCircleIcon className="w-20 h-20 text-blue-500 mx-auto" />
                )
              ) : (
                <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
              )}
            </div>

            <h1 className={`text-4xl font-bold mb-6 ${
              result.success
                ? isApproved
                  ? 'text-green-600'
                  : isRejected
                    ? 'text-red-600'
                    : 'text-blue-600'
                : 'text-red-600'
            }`}>
              {result.success
                ? isApproved
                  ? '✅ User Approved'
                  : isRejected
                    ? '❌ Registration Rejected'
                    : 'Action Completed'
                : '⚠️ Verification Failed'
              }
            </h1>

            {result.user && (
              <div className="mb-6">
                <p className="text-xl text-primary-forest font-medium">
                  {result.user}
                </p>
              </div>
            )}

            <div className={`text-center p-6 rounded-xl mb-8 ${
              result.success
                ? isApproved
                  ? 'bg-green-50'
                  : isRejected
                    ? 'bg-red-50'
                    : 'bg-blue-50'
                : 'bg-red-50'
            }`}>
              <p className={`text-lg font-medium ${
                result.success
                  ? isApproved
                    ? 'text-green-800'
                    : isRejected
                      ? 'text-red-800'
                      : 'text-blue-800'
                  : 'text-red-800'
              }`}>
                {result.success
                  ? isApproved
                    ? 'User can now sign in to the system'
                    : isRejected
                      ? 'Registration has been deleted'
                      : result.message
                  : result.message
                }
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.close()}
                className="bg-primary-forest text-accent-white px-8 py-3 rounded-lg hover:bg-secondary-teal transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => router.push('/overview')}
                className="bg-secondary-gray text-accent-white px-8 py-3 rounded-lg hover:bg-accent-charcoal transition-colors font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}