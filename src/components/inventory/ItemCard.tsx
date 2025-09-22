'use client'

import { InventoryItemWithCategory } from '@/types'
import { useState } from 'react'
import Image from 'next/image'

interface ItemCardProps {
  item: InventoryItemWithCategory
  onEdit: (item: InventoryItemWithCategory) => void
  onDelete: (id: string) => void
  onViewDetails: (id: string) => void
}

export default function ItemCard({ item, onEdit, onDelete, onViewDetails }: ItemCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getStockStatus = () => {
    if (item.quantity <= item.minStock) {
      return { status: 'low', color: 'bg-red-100 text-red-800', label: 'Low Stock' }
    } else if (item.quantity >= item.maxStock) {
      return { status: 'high', color: 'bg-blue-100 text-blue-800', label: 'Full Stock' }
    }
    return { status: 'normal', color: 'bg-green-100 text-green-800', label: 'In Stock' }
  }

  const stockStatus = getStockStatus()

  return (
    <div
      className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      onClick={() => onViewDetails(item.id)}
    >
      {/* Item Image */}
      <div className="h-48 bg-gradient-to-br from-primary-cream to-accent-lightGold relative">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <Image
            src={item.imageUrls[0]}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg className="w-16 h-16 text-secondary-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        
        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="bg-accent-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-accent-white transition-colors"
          >
            <svg className="w-4 h-4 text-secondary-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-accent-white rounded-lg shadow-lg border border-secondary-sage/10 py-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDetails(item.id)
                  setShowActions(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-secondary-gray hover:bg-primary-cream transition-colors"
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                  setShowActions(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-secondary-gray hover:bg-primary-cream transition-colors"
              >
                Edit Item
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                  setShowActions(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete Item
              </button>
            </div>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
            {stockStatus.label}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-primary-forest line-clamp-2">
            {item.name}
          </h3>
          {item.category && (
            <span
              className="px-2 py-1 text-xs font-medium rounded-full text-white ml-2 flex-shrink-0"
              style={{ backgroundColor: item.category.color }}
            >
              {item.category.name}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-secondary-gray mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-gray">SKU:</span>
            <span className="text-sm font-medium text-primary-forest">{item.sku}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-gray">Quantity:</span>
            <span className="text-sm font-bold text-primary-forest">{item.quantity}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-gray">Unit Price:</span>
            <span className="text-sm font-medium text-primary-forest">₱{item.unitPrice.toString()}</span>
          </div>

          {item.location && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-gray">Location:</span>
              <span className="text-sm font-medium text-primary-forest">{item.location}</span>
            </div>
          )}
        </div>

        {/* Stock Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-secondary-gray">Stock Level</span>
            <span className="text-xs text-secondary-gray">{item.quantity}/{item.maxStock}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                item.quantity <= item.minStock 
                  ? 'bg-red-500' 
                  : item.quantity >= item.maxStock 
                  ? 'bg-blue-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}