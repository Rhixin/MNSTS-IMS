'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/types'
import StockChart from '@/components/charts/StockChart'
import CategoryChart from '@/components/charts/CategoryChart'
import MovementChart from '@/components/charts/MovementChart'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'

export default function OverviewPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentMovements: 0
  })
  const [loading, setLoading] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchLowStockAlerts()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const { summary } = result.data
          setStats({
            totalItems: summary.totalItems,
            lowStockItems: summary.lowStockItems,
            totalValue: summary.totalValue,
            recentMovements: summary.recentMovements
          })
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Fallback to mock data if API fails
      setStats({
        totalItems: 0,
        lowStockItems: 0,
        totalValue: 0,
        recentMovements: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStockAlerts = async () => {
    try {
      const response = await fetch('/api/alerts/low-stock')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setLowStockAlerts(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching low stock alerts:', error)
    } finally {
      setAlertsLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-forest">Overview</h1>
          <p className="text-secondary-gray">Dashboard analytics and key metrics</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-gray">Total Items</p>
                <p className="text-3xl font-bold text-primary-forest">{stats.totalItems}</p>
              </div>
              <div className="p-3 bg-primary-golden/10 rounded-lg">
                <svg className="w-8 h-8 text-primary-golden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-gray">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-gray">Total Value</p>
                <p className="text-3xl font-bold text-primary-forest">₱{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-gray">Recent Movements</p>
                <p className="text-3xl font-bold text-primary-forest">{stats.recentMovements}</p>
              </div>
              <div className="p-3 bg-secondary-sage/10 rounded-lg">
                <svg className="w-8 h-8 text-secondary-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart />
          <CategoryChart />
        </div>

        <div>
          <MovementChart />
        </div>

        {/* Quick Actions and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <h2 className="text-xl font-bold text-primary-forest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/inventory')}
                className="bg-primary-forest text-accent-white p-4 rounded-lg hover:bg-secondary-teal transition-colors text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
              <button 
                onClick={() => router.push('/stock-in')}
                className="bg-primary-golden text-primary-forest p-4 rounded-lg hover:bg-accent-lightGold transition-colors text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Stock In
              </button>
              <button 
                onClick={() => router.push('/stock-out')}
                className="bg-secondary-sage text-accent-white p-4 rounded-lg hover:bg-secondary-teal transition-colors text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Stock Out
              </button>
              <button 
                onClick={() => router.push('/reports')}
                className="bg-secondary-gray text-accent-white p-4 rounded-lg hover:bg-accent-charcoal transition-colors text-center"
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </button>
            </div>
          </div>

          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <h2 className="text-xl font-bold text-primary-forest mb-4">Low Stock Alerts</h2>
            <div className="space-y-3">
              {alertsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-forest"></div>
                </div>
              ) : lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      alert.priorityColor === 'red'
                        ? 'bg-red-50 border-red-200'
                        : alert.priorityColor === 'orange'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${
                        alert.priorityColor === 'red'
                          ? 'text-red-800'
                          : alert.priorityColor === 'orange'
                          ? 'text-orange-800'
                          : 'text-yellow-800'
                      }`}>
                        {alert.name}
                      </p>
                      <p className={`text-sm ${
                        alert.priorityColor === 'red'
                          ? 'text-red-600'
                          : alert.priorityColor === 'orange'
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}>
                        {alert.message} • {alert.category}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      alert.priorityColor === 'red'
                        ? 'bg-red-200 text-red-800'
                        : alert.priorityColor === 'orange'
                        ? 'bg-orange-200 text-orange-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {alert.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-gray">
                  <p>No low stock alerts</p>
                  <p className="text-sm">All items are above minimum stock levels</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}