'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import ChatbotAssistant from '@/components/ChatbotAssistant'
import { Bars3Icon } from '@heroicons/react/24/outline'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          throw new Error('Not authenticated')
        }
        const userData = await response.json()
        if (!userData.success) {
          throw new Error('Not authenticated')
        }
        setUser(userData.data.user)
      } catch (error) {
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-forest mx-auto mb-4"></div>
          <p className="text-secondary-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-primary-cream">
      {/* Persistent Sidebar - Only renders once */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-accent-white shadow-sm border-b border-secondary-sage/20 lg:pl-0">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-primary-forest hover:text-secondary-teal transition-colors mr-4"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-primary-forest lg:hidden">
                MNSTS IMS
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-secondary-gray text-sm">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary-forest text-accent-white px-4 py-2 rounded-lg hover:bg-secondary-teal transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content - This is where child pages render */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary-cream">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chatbot Assistant */}
      <ChatbotAssistant />
    </div>
  )
}