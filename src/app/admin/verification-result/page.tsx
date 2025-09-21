'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline'

export default function VerificationResultPage() {
  const searchParams = useSearchParams()
  const action = searchParams.get('action') // 'approved' or 'rejected'
  const userName = searchParams.get('user') || 'Unknown User'

  const isApproved = action === 'approved'

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-cream to-accent-lightGold flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-accent-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6">
              {isApproved ? (
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
              ) : (
                <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
              )}
            </div>

            <h1 className={`text-3xl font-bold mb-4 ${
              isApproved ? 'text-green-700' : 'text-red-700'
            }`}>
              User Registration {isApproved ? 'Approved' : 'Rejected'}
            </h1>

            <div className="bg-secondary-sage/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <UserIcon className="w-5 h-5 text-primary-forest mr-2" />
                <span className="font-medium text-primary-forest">User Details</span>
              </div>
              <p className="text-lg text-primary-forest">
                <strong>{decodeURIComponent(userName)}</strong>
              </p>
            </div>

            {isApproved ? (
              <div className="text-center">
                <p className="text-lg text-green-700 mb-4">
                  ✅ The user has been successfully approved and can now sign in to the MNSTS Inventory Management System.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">What happens next:</h3>
                  <ul className="text-sm text-green-700 text-left space-y-1">
                    <li>• User account is now active and verified</li>
                    <li>• User can sign in with their email and password</li>
                    <li>• User has access to the inventory management system</li>
                    <li>• No further action required from admin</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg text-red-700 mb-4">
                  ❌ The registration request has been rejected and the user account has been deleted.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-800 mb-2">What this means:</h3>
                  <ul className="text-sm text-red-700 text-left space-y-1">
                    <li>• User account has been permanently deleted</li>
                    <li>• User cannot sign in to the system</li>
                    <li>• User will need to register again if access is needed</li>
                    <li>• No further action required from admin</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.close()}
                className="bg-secondary-gray text-accent-white px-6 py-3 rounded-lg hover:bg-accent-charcoal transition-colors"
              >
                Close Window
              </button>
              <a
                href="/login"
                className="bg-primary-forest text-accent-white px-6 py-3 rounded-lg hover:bg-secondary-teal transition-colors text-center"
              >
                Go to Login Page
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-sage/20">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary-forest mb-2">MNSTS IMS</h2>
                <p className="text-secondary-gray">Medellin National Science and Technology School</p>
                <p className="text-sm text-secondary-gray mt-2">
                  Admin Verification System
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}