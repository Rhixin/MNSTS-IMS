'use client'

import { useState, useEffect } from 'react'
import { InventoryItemWithCategory, Category } from '@/types'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import CustomSelect from '@/components/ui/CustomSelect'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { StockPageSkeleton } from '@/components/ui/SkeletonLoader'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

interface StockMovement {
  id: string
  itemId: string
  quantity: number
  reason: string
  notes?: string
  createdAt: string
  item: InventoryItemWithCategory
}

export default function StockOutPage() {
  const [items, setItems] = useState<InventoryItemWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Form state
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/categories')
      ])

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData.data.items || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !quantity || !reason) return

    const item = items.find(i => i.id === selectedItem)
    const requestedQuantity = parseInt(quantity)

    if (item && requestedQuantity > item.quantity) {
      showError(
        'Insufficient Stock',
        `Cannot remove ${requestedQuantity} items. Only ${item.quantity} available in stock.`
      )
      return
    }

    setShowConfirmModal(true)
  }

  const handleStockOut = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          type: 'OUT',
          quantity: parseInt(quantity),
          reason,
          notes
        })
      })

      if (response.ok) {
        // Reset form
        setSelectedItem('')
        setQuantity('')
        setReason('')
        setNotes('')
        
        // Refresh data
        fetchData()
        
        showSuccess('Stock Removed!', 'Stock has been removed successfully.')
      } else {
        showError('Failed to Remove Stock', 'Unable to remove stock from inventory.')
      }
    } catch (error) {
      console.error('Error removing stock:', error)
      showError('Error', 'An unexpected error occurred while removing stock.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    return matchesCategory && item.quantity > 0
  })

  const selectedItemData = items.find(item => item.id === selectedItem)

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <StockPageSkeleton />
      </>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-forest">Stock Out</h1>
          <p className="text-sm sm:text-base text-secondary-gray">Remove inventory from existing items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Stock Out Form */}
          <div className="lg:col-span-2">
            <div className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-forest mb-4 sm:mb-6">Remove Stock</h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                {/* Item Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">
                      Search & Select Item *
                    </label>
                    <SearchableSelect
                      options={filteredItems.map(item => ({
                        value: item.id,
                        label: `${item.name} (SKU: ${item.sku}) - Available: ${item.quantity}`,
                        searchText: `${item.name} ${item.sku} ${item.description || ''}`
                      }))}
                      value={selectedItem}
                      onChange={setSelectedItem}
                      placeholder="Type to search available items..."
                      required
                      emptyMessage="No available items found. Try changing the category filter."
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">
                      Filter by Category
                    </label>
                    <CustomSelect
                      options={[
                        { value: "", label: "All Categories" },
                        ...categories.map(category => ({
                          value: category.id,
                          label: category.name
                        }))
                      ]}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      placeholder="All Categories"
                    />
                  </div>
                </div>

                {selectedItemData && (
                  <div className="bg-secondary-sage/10 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-primary-forest mb-2 text-sm sm:text-base">Selected Item Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-secondary-gray">Current Stock:</span>
                        <span className="ml-2 font-medium">{selectedItemData.quantity}</span>
                      </div>
                      <div>
                        <span className="text-secondary-gray">Min Stock:</span>
                        <span className="ml-2 font-medium">{selectedItemData.minStock}</span>
                      </div>
                      <div>
                        <span className="text-secondary-gray">Location:</span>
                        <span className="ml-2 font-medium">{selectedItemData.location || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-gray">Category:</span>
                        <span className="ml-2 font-medium">{selectedItemData.category.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">
                      Quantity to Remove *
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      max={selectedItemData?.quantity || undefined}
                      required
                      className="w-full px-3 sm:px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
                      placeholder="Enter quantity"
                    />
                    {selectedItemData && quantity && parseInt(quantity) > selectedItemData.quantity && (
                      <p className="text-red-600 text-xs sm:text-sm mt-1">
                        Cannot exceed available stock ({selectedItemData.quantity})
                      </p>
                    )}
                    {selectedItemData && quantity && (selectedItemData.quantity - parseInt(quantity)) < selectedItemData.minStock && (
                      <p className="text-orange-600 text-xs sm:text-sm mt-1">
                        Warning: This will put stock below minimum level ({selectedItemData.minStock})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">
                      Reason *
                    </label>
                    <CustomSelect
                      options={[
                        { value: "Used/Consumed", label: "Used/Consumed" },
                        { value: "Damaged", label: "Damaged" },
                        { value: "Lost", label: "Lost" },
                        { value: "Expired", label: "Expired" },
                        { value: "Transferred", label: "Transferred" },
                        { value: "Sold", label: "Sold" },
                        { value: "Correction", label: "Correction" },
                        { value: "Other", label: "Other" }
                      ]}
                      value={reason}
                      onChange={setReason}
                      placeholder="Select reason..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
                    placeholder="Additional notes about this stock movement..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing || (selectedItemData && parseInt(quantity) > selectedItemData.quantity)}
                  className="w-full bg-red-600 text-accent-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {processing ? 'Processing...' : 'Remove Stock'}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
              <h3 className="text-base sm:text-lg font-semibold text-primary-forest mb-3 sm:mb-4">Quick Stats</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-secondary-gray">Available Items</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary-forest">
                    {items.filter(item => item.quantity > 0).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-secondary-gray">Out of Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {items.filter(item => item.quantity === 0).length}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-secondary-gray">Low Stock Items</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {items.filter(item => item.quantity > 0 && item.quantity <= item.minStock).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Warnings */}
            <div className="bg-accent-white rounded-xl shadow-sm p-4 sm:p-6 border border-secondary-sage/10">
              <h3 className="text-base sm:text-lg font-semibold text-primary-forest mb-3 sm:mb-4">Stock Warnings</h3>
              <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto">
                {/* Out of Stock */}
                {items.filter(item => item.quantity === 0).slice(0, 3).map(item => (
                  <div key={item.id} className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-800 text-xs sm:text-sm">{item.name}</p>
                    <p className="text-xs text-red-600">Out of stock</p>
                  </div>
                ))}
                
                {/* Low Stock */}
                {items.filter(item => item.quantity > 0 && item.quantity <= item.minStock).slice(0, 3).map(item => (
                  <div key={item.id} className="p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-orange-800 text-xs sm:text-sm">{item.name}</p>
                    <p className="text-xs text-orange-600">Low stock: {item.quantity} left</p>
                  </div>
                ))}
                
                {items.filter(item => item.quantity === 0 || (item.quantity > 0 && item.quantity <= item.minStock)).length === 0 && (
                  <p className="text-xs sm:text-sm text-secondary-gray text-center py-3 sm:py-4">
                    No stock warnings
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleStockOut}
          title="Confirm Stock Removal"
          message="Are you sure you want to remove this stock? This action cannot be undone."
          confirmText="Remove Stock"
          cancelText="Cancel"
          type="danger"
          details={
            selectedItemData && (
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Item:</span>
                  <span>{selectedItemData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Current Stock:</span>
                  <span>{selectedItemData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Removing:</span>
                  <span className="text-red-600 font-semibold">-{quantity}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">New Total:</span>
                  <span className={`font-semibold ${
                    (selectedItemData.quantity - parseInt(quantity || '0')) <= selectedItemData.minStock
                      ? 'text-orange-600'
                      : ''
                  }`}>
                    {selectedItemData.quantity - parseInt(quantity || '0')}
                  </span>
                </div>
                {(selectedItemData.quantity - parseInt(quantity || '0')) <= selectedItemData.minStock && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                    <p className="text-orange-800 text-xs font-medium">
                      ⚠️ This will put stock below minimum level ({selectedItemData.minStock})
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Reason:</span>
                  <span>{reason}</span>
                </div>
              </div>
            )
          }
        />
      </div>
    </>
  )
}