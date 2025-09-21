'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to overview page
    router.replace('/overview')
  }, [router])

  return (
    <div className="min-h-screen bg-primary-cream flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-forest mx-auto mb-4"></div>
        <p className="text-secondary-gray">Redirecting to Overview...</p>
      </div>
    </div>
  )
}