'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { InventoryItemWithCategory, Category, ItemForm as ItemFormType } from '@/types'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import { ItemDetailsSkeleton } from '@/components/ui/SkeletonLoader'
import ImageViewer from '@/components/ui/ImageViewer'
import ItemForm from '@/components/inventory/ItemForm'
import Image from 'next/image'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function ItemDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [item, setItem] = useState<InventoryItemWithCategory | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemName: '' })
  const [imageViewer, setImageViewer] = useState({ isOpen: false, index: 0 })
  const [showEditForm, setShowEditForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast()

  useEffect(() => {
    if (itemId) {
      fetchItem()
      fetchCategories()
    }
  }, [itemId])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`)
      const result = await response.json()

      if (result.success) {
        setItem(result.data)
      } else {
        showError('Item Not Found', 'The requested item could not be found.')
        router.push('/inventory')
      }
    } catch (error) {
      console.error('Error fetching item:', error)
      showError('Error', 'Failed to load item details.')
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

  const handleEdit = () => {
    setShowEditForm(true)
  }

  const handleEditSubmit = async (formData: ItemFormType) => {
    setFormLoading(true)
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setShowEditForm(false)
        fetchItem() // Refresh the item data
        showSuccess('Item Updated!', 'Item has been updated successfully.')
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

  const handleDeleteClick = () => {
    if (item) {
      setDeleteModal({ isOpen: true, itemName: item.name })
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        showSuccess('Item Deleted!', 'Item has been deleted successfully.')
        router.push('/inventory')
      } else {
        showError('Delete Failed', result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      showError('Error', 'An unexpected error occurred while deleting the item')
    }
    setDeleteModal({ isOpen: false, itemName: '' })
  }

  const getStockStatus = () => {
    if (!item) return { status: 'unknown', color: 'gray', text: 'Unknown' }

    if (item.quantity === 0) {
      return { status: 'out', color: 'red', text: 'Out of Stock' }
    } else if (item.quantity <= item.minStock) {
      return { status: 'low', color: 'yellow', text: 'Low Stock' }
    } else {
      return { status: 'good', color: 'green', text: 'In Stock' }
    }
  }

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <ItemDetailsSkeleton />
      </>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-16 h-16 text-secondary-gray/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-secondary-gray mb-2">Item Not Found</h3>
        <p className="text-secondary-gray mb-4">The requested item could not be found.</p>
        <button
          onClick={() => router.push('/inventory')}
          className="bg-primary-forest text-accent-white px-6 py-2 rounded-lg hover:bg-secondary-teal transition-colors"
        >
          Back to Inventory
        </button>
      </div>
    )
  }

  const stockStatus = getStockStatus()

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/inventory')}
              className="p-2 hover:bg-primary-cream rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-secondary-gray" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-primary-forest">{item.name}</h1>
              <p className="text-secondary-gray">SKU: {item.sku}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-golden text-primary-forest rounded-lg hover:bg-accent-lightGold transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Images */}
          <div className="lg:col-span-1">
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Images</h3>

              {item.imageUrls && item.imageUrls.length > 0 ? (
                <div className="space-y-4">
                  {/* Primary Image */}
                  <div
                    className="aspect-square rounded-lg overflow-hidden border-2 border-secondary-sage/20 cursor-pointer group relative"
                    onClick={() => setImageViewer({ isOpen: true, index: 0 })}
                  >
                    <Image
                      src={item.imageUrls[0]}
                      alt={item.name}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Additional Images */}
                  {item.imageUrls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {item.imageUrls.slice(1).map((url, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-md overflow-hidden border border-secondary-sage/20 cursor-pointer group relative"
                          onClick={() => setImageViewer({ isOpen: true, index: index + 1 })}
                        >
                          <Image
                            src={url}
                            alt={`${item.name} ${index + 2}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-lg border-2 border-dashed border-secondary-gray/30 flex items-center justify-center">
                  <div className="text-center">
                    <CubeIcon className="w-12 h-12 text-secondary-gray/50 mx-auto mb-2" />
                    <p className="text-secondary-gray">No images available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">Name</label>
                    <p className="text-primary-forest font-medium">{item.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">SKU</label>
                    <p className="text-primary-forest font-mono">{item.sku}</p>
                  </div>

                  {item.barcode && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-gray mb-1">Barcode</label>
                      <p className="text-primary-forest font-mono">{item.barcode}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">Category</label>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.category.color }}
                      ></div>
                      <span className="text-primary-forest">{item.category.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">Stock Status</label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-${stockStatus.color}-500`}></div>
                      <span className={`text-${stockStatus.color}-600 font-medium`}>{stockStatus.text}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">Unit Price</label>
                    <p className="text-primary-forest font-medium">₱{parseFloat(item.unitPrice.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>

                  {item.location && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-gray mb-1">Location</label>
                      <p className="text-primary-forest">{item.location}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-secondary-gray mb-1">Created</label>
                    <p className="text-primary-forest">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-gray mb-1">Description</label>
                  <p className="text-primary-forest">{item.description}</p>
                </div>
              )}
            </div>

            {/* Stock Information */}
            <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Stock Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-forest/10 rounded-lg mx-auto mb-3">
                    <CubeIcon className="w-8 h-8 text-primary-forest" />
                  </div>
                  <p className="text-sm text-secondary-gray">Current Stock</p>
                  <p className="text-2xl font-bold text-primary-forest">{item.quantity}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-lg mx-auto mb-3">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-sm text-secondary-gray">Minimum Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{item.minStock}</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mx-auto mb-3">
                    <CubeIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-secondary-gray">Maximum Stock</p>
                  <p className="text-2xl font-bold text-green-600">{item.maxStock}</p>
                </div>
              </div>

              {/* Stock Alert */}
              {item.quantity <= item.minStock && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Stock Alert</h4>
                      <p className="text-sm text-yellow-700">
                        {item.quantity === 0
                          ? 'This item is out of stock!'
                          : `Stock is running low. Only ${item.quantity} items remaining.`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, itemName: '' })}
          onConfirm={handleDeleteConfirm}
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteModal.itemName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        {/* Edit Form Modal */}
        {item && (
          <ItemForm
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            onSubmit={handleEditSubmit}
            categories={categories}
            editingItem={item}
            loading={formLoading}
            onError={showError}
            onWarning={showWarning}
          />
        )}

        {/* Image Viewer Modal */}
        {item && (
          <ImageViewer
            isOpen={imageViewer.isOpen}
            onClose={() => setImageViewer({ isOpen: false, index: 0 })}
            images={item.imageUrls || []}
            initialIndex={imageViewer.index}
            title={item.name}
          />
        )}
      </div>
    </>
  )
}