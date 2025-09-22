'use client'

import { useState, useEffect } from 'react'
import { InventoryItemWithCategory } from '@/types'
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { StockHistoryPageSkeleton } from '@/components/ui/SkeletonLoader'

interface StockMovement {
  id: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  reason: string
  notes?: string
  createdAt: string
  item: {
    id: string
    name: string
    sku: string
    category: {
      name: string
      color: string
    }
  }
  user: {
    firstName: string
    lastName: string
  }
}

interface MovementFilters {
  type: string
  dateFrom: string
  dateTo: string
  itemId: string
  reason: string
}

const MOVEMENT_TYPES = [
  { value: 'IN', label: 'Stock In', icon: ArrowUpCircleIcon, color: 'text-green-600' },
  { value: 'OUT', label: 'Stock Out', icon: ArrowDownCircleIcon, color: 'text-red-600' },
  { value: 'ADJUSTMENT', label: 'Adjustment', icon: WrenchScrewdriverIcon, color: 'text-blue-600' },
  { value: 'TRANSFER', label: 'Transfer', icon: ArrowsRightLeftIcon, color: 'text-purple-600' }
]

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [items, setItems] = useState<InventoryItemWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<MovementFilters>({
    type: '',
    dateFrom: '',
    dateTo: '',
    itemId: '',
    reason: ''
  })

  useEffect(() => {
    fetchMovements()
  }, [currentPage, filters])

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchMovements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.type && { type: filters.type }),
        ...(filters.itemId && { itemId: filters.itemId }),
        ...(filters.reason && { reason: filters.reason }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      })

      const response = await fetch(`/api/stock-movements?${params}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMovements(result.data.movements)
          setTotalPages(result.data.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setItems(result.data.items || [])
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const getMovementTypeInfo = (type: string) => {
    return MOVEMENT_TYPES.find(t => t.value === type) || MOVEMENT_TYPES[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const resetFilters = () => {
    setFilters({
      type: '',
      dateFrom: '',
      dateTo: '',
      itemId: '',
      reason: ''
    })
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-primary-forest">Stock Movement History</h1>
        <p className="text-sm sm:text-base text-secondary-gray">Track all inventory movements and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {MOVEMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">Item</label>
              <select
                value={filters.itemId}
                onChange={(e) => setFilters(prev => ({ ...prev, itemId: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              >
                <option value="">All Items</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-secondary-gray text-accent-white px-3 sm:px-4 py-2 rounded-lg hover:bg-accent-charcoal transition-colors text-sm sm:text-base"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

      {/* Movement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {MOVEMENT_TYPES.map(type => {
          const count = movements.filter(m => m.type === type.value).length
          const Icon = type.icon
          return (
            <div key={type.value} className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-secondary-gray">{type.label}</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-forest">{count}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${type.color} bg-opacity-10 flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${type.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Movements Table */}
      {loading ? (
        <StockHistoryPageSkeleton />
      ) : (
        <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10">
          {movements.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <ArrowsRightLeftIcon className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-gray/50 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-secondary-gray mb-2">No movements found</h3>
            <p className="text-sm sm:text-base text-secondary-gray">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-cream/50 border-b border-secondary-sage/20">
                  <tr>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base">Type</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base">Item</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base">Quantity</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base hidden md:table-cell">Reason</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base hidden lg:table-cell">User</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-semibold text-primary-forest text-sm sm:text-base">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-sage/10">
                  {movements.map((movement) => {
                    const typeInfo = getMovementTypeInfo(movement.type)
                    const Icon = typeInfo.icon
                    return (
                      <tr key={movement.id} className="hover:bg-primary-cream/20 transition-colors">
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${typeInfo.color} bg-opacity-10`}>
                              <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${typeInfo.color}`} />
                            </div>
                            <span className="font-medium text-primary-forest text-xs sm:text-sm">{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div>
                            <p className="font-medium text-primary-forest text-xs sm:text-sm">{movement.item.name}</p>
                            <p className="text-xs text-secondary-gray">SKU: {movement.item.sku}</p>
                            <div className="flex items-center mt-1">
                              <div
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2"
                                style={{ backgroundColor: movement.item.category.color }}
                              ></div>
                              <span className="text-xs text-secondary-gray">{movement.item.category.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <span className={`font-semibold text-sm sm:text-base ${
                            movement.type === 'IN' || movement.type === 'ADJUSTMENT'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {movement.type === 'IN' || movement.type === 'ADJUSTMENT' ? '+' : '-'}{movement.quantity}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 hidden md:table-cell">
                          <div>
                            <p className="text-primary-forest text-xs sm:text-sm">{movement.reason}</p>
                            {movement.notes && (
                              <p className="text-xs text-secondary-gray mt-1">{movement.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 hidden lg:table-cell">
                          <span className="text-primary-forest text-xs sm:text-sm">
                            {movement.user.firstName} {movement.user.lastName}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <span className="text-secondary-gray text-xs sm:text-sm">{formatDate(movement.createdAt)}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-t border-secondary-sage/10">
                <div className="text-xs sm:text-sm text-secondary-gray">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 text-secondary-gray hover:text-primary-forest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 text-secondary-gray hover:text-primary-forest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      )}
    </div>
  )
}