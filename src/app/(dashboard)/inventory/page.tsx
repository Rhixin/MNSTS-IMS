'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InventoryItemWithCategory, Category, ItemForm as ItemFormType } from '@/types'
import ItemCard from '@/components/inventory/ItemCard'
import ItemForm from '@/components/inventory/ItemForm'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import ConfirmModal from '@/components/ui/ConfirmModal'
import CustomSelect from '@/components/ui/CustomSelect'
import { InventoryGridSkeleton, StatsCardsSkeleton, FiltersSkeleton } from '@/components/ui/SkeletonLoader'

interface InventoryData {
  items: InventoryItemWithCategory[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function InventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inventoryData, setInventoryData] = useState<InventoryData>({
    items: [],
    pagination: { page: 1, limit: 12, total: 0, pages: 0 }
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItemWithCategory | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, itemId: string, itemName: string}>({
    isOpen: false,
    itemId: '',
    itemName: ''
  })
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchInventory()
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage])

  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && inventoryData.items.length > 0) {
      const itemToEdit = inventoryData.items.find(item => item.id === editId)
      if (itemToEdit) {
        setEditingItem(itemToEdit)
        setShowForm(true)
        // Clear the URL parameter
        router.replace('/inventory')
      }
    }
  }, [searchParams, inventoryData.items, router])

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/inventory?${params}`)
      const result = await response.json()

      if (result.success) {
        setInventoryData(result.data)
      } else {
        console.error('Failed to fetch inventory:', result.error)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (formData: ItemFormType) => {
    setFormLoading(true)
    try {
      const url = editingItem ? `/api/inventory/${editingItem.id}` : '/api/inventory'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setShowForm(false)
        setEditingItem(null)
        fetchInventory()
        showSuccess(
          editingItem ? 'Item Updated!' : 'Item Added!',
          editingItem ? 'Item has been updated successfully.' : 'New item has been added to inventory.'
        )
      } else {
        showError('Save Failed', result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Error saving item:', error)
      showError('Error', 'An unexpected error occurred while saving the item')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (item: InventoryItemWithCategory) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemName: name
    })
  }

  const handleDeleteConfirm = async () => {

    try {
      const response = await fetch(`/api/inventory/${deleteModal.itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchInventory()
        showSuccess('Item Deleted!', 'Item has been deleted successfully.')
      } else {
        showError('Delete Failed', result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      showError('Error', 'An unexpected error occurred while deleting the item')
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/inventory/${id}`)
  }


  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary-forest">Inventory Management</h1>
            <p className="text-secondary-gray">Manage your inventory items, stock levels, and categories</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setShowForm(true)
            }}
            className="bg-primary-forest text-accent-white px-6 py-3 rounded-lg hover:bg-secondary-teal transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Item</span>
          </button>
        </div>

        {/* Filters and Search */}
        {loading ? (
          <FiltersSkeleton />
        ) : (
          <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Search Items
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                  placeholder="Search by name, SKU, or description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Category
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
                  onChange={(value) => {
                    setSelectedCategory(value)
                    setCurrentPage(1)
                  }}
                  placeholder="All Categories"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Sort By
                </label>
                <CustomSelect
                  options={[
                    { value: "createdAt", label: "Date Added" },
                    { value: "name", label: "Name" },
                    { value: "quantity", label: "Quantity" },
                    { value: "unitPrice", label: "Price" }
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Order
                </label>
                <CustomSelect
                  options={[
                    { value: "desc", label: "Descending" },
                    { value: "asc", label: "Ascending" }
                  ]}
                  value={sortOrder}
                  onChange={setSortOrder}
                />
              </div>
            </div>
          </div>
        )}

        {/* Inventory Stats */}
        {loading ? (
          <StatsCardsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-gray">Total Items</p>
                  <p className="text-2xl font-bold text-primary-forest">{inventoryData.pagination.total}</p>
                </div>
                <div className="p-3 bg-primary-golden/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary-golden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-gray">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventoryData.items.filter(item => item.quantity <= item.minStock).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-gray">Categories</p>
                  <p className="text-2xl font-bold text-primary-forest">{categories.length}</p>
                </div>
                <div className="p-3 bg-secondary-sage/10 rounded-lg">
                  <svg className="w-6 h-6 text-secondary-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Grid */}
        {loading ? (
          <InventoryGridSkeleton count={12} />
        ) : inventoryData.items.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-secondary-gray/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-gray mb-2">No items found</h3>
            <p className="text-secondary-gray mb-4">
              {searchTerm || selectedCategory ? 'Try adjusting your filters' : 'Start by adding your first inventory item'}
            </p>
            <button
              onClick={() => {
                setEditingItem(null)
                setShowForm(true)
              }}
              className="bg-primary-forest text-accent-white px-6 py-2 rounded-lg hover:bg-secondary-teal transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventoryData.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={(id) => handleDeleteClick(id, item.name)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {inventoryData.pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-secondary-gray border border-secondary-gray rounded-lg hover:bg-primary-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: inventoryData.pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-primary-forest text-accent-white'
                      : 'text-secondary-gray border border-secondary-gray hover:bg-primary-cream'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, inventoryData.pagination.pages))}
                disabled={currentPage === inventoryData.pagination.pages}
                className="px-4 py-2 text-secondary-gray border border-secondary-gray rounded-lg hover:bg-primary-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Item Form Modal */}
        <ItemForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
          onSubmit={handleSubmit}
          categories={categories}
          editingItem={editingItem}
          loading={formLoading}
          onError={showError}
          onWarning={showWarning}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({isOpen: false, itemId: '', itemName: ''})}
          onConfirm={handleDeleteConfirm}
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteModal.itemName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </>
  )
}