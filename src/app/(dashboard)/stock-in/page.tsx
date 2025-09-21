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

export default function StockInPage() {
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

  const { toasts, removeToast, showSuccess, showError } = useToast()

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
    setShowConfirmModal(true)
  }

  const handleStockIn = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/stock-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem,
          type: 'IN',
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

        showSuccess('Stock Added!', 'Stock has been added successfully.')
      } else {
        showError('Failed to Add Stock', 'Unable to add stock to inventory.')
      }
    } catch (error) {
      console.error('Error adding stock:', error)
      showError('Error', 'An unexpected error occurred while adding stock.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory
    return matchesCategory
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
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-primary-forest">Stock In</h1>
          <p className="text-secondary-gray">Add inventory to existing items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock In Form */}
          <div className="lg:col-span-2">
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h2 className="text-xl font-semibold text-primary-forest mb-6">Add Stock</h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Item Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
                      Search & Select Item *
                    </label>
                    <SearchableSelect
                      options={filteredItems.map(item => ({
                        value: item.id,
                        label: `${item.name} (SKU: ${item.sku}) - Current: ${item.quantity}`,
                        searchText: `${item.name} ${item.sku} ${item.description || ''}`
                      }))}
                      value={selectedItem}
                      onChange={setSelectedItem}
                      placeholder="Type to search items by name or SKU..."
                      required
                      emptyMessage="No items found. Try changing the category filter."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
                      Quantity to Add *
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      required
                      className="w-full px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
                      Reason *
                    </label>
                    <CustomSelect
                      options={[
                        { value: "Purchase", label: "Purchase" },
                        { value: "Donation", label: "Donation" },
                        { value: "Return", label: "Return" },
                        { value: "Found", label: "Found" },
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
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                    placeholder="Additional notes about this stock movement..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-primary-forest text-accent-white py-3 rounded-lg hover:bg-secondary-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Add Stock'}
                </button>
              </form>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-secondary-gray">Total Items</p>
                  <p className="text-2xl font-bold text-primary-forest">{items.length}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-gray">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {items.filter(item => item.quantity <= item.minStock).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-secondary-gray">Categories</p>
                  <p className="text-2xl font-bold text-primary-forest">{categories.length}</p>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Low Stock Alert</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.filter(item => item.quantity <= item.minStock).slice(0, 5).map(item => (
                  <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-800 text-sm">{item.name}</p>
                    <p className="text-xs text-red-600">Only {item.quantity} left (Min: {item.minStock})</p>
                  </div>
                ))}
                {items.filter(item => item.quantity <= item.minStock).length === 0 && (
                  <p className="text-sm text-secondary-gray text-center py-4">
                    No low stock items
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
          onConfirm={handleStockIn}
          title="Confirm Stock Addition"
          message="Are you sure you want to add this stock? This action will update the inventory levels."
          confirmText="Add Stock"
          cancelText="Cancel"
          type="success"
          details={
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Item:</span>
                <span>{selectedItemData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current Stock:</span>
                <span>{selectedItemData?.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Adding:</span>
                <span className="text-green-600 font-semibold">+{quantity}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">New Total:</span>
                <span className="font-semibold">{(selectedItemData?.quantity || 0) + parseInt(quantity || '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reason:</span>
                <span>{reason}</span>
              </div>
            </div>
          }
        />
      </div>
    </>
  )
}