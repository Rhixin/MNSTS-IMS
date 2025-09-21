'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'success' | 'info'
  details?: React.ReactNode
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  details
}: ConfirmationModalProps) {

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          icon: ExclamationTriangleIcon
        }
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmBg: 'bg-green-600 hover:bg-green-700',
          icon: CheckCircleIcon
        }
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          icon: ExclamationTriangleIcon
        }
      default: // warning
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-primary-forest hover:bg-secondary-teal',
          icon: ExclamationTriangleIcon
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = styles.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ margin: 0 }}>
      <div
        className="bg-accent-white rounded-2xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ margin: 0 }}
      >
        <div className="p-8">
          <div className="text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
              <IconComponent className={`h-8 w-8 ${styles.iconColor}`} aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-primary-forest mb-2" style={{ margin: 0 }}>
              {title}
            </h3>
            <p className="text-secondary-gray mb-6" style={{ margin: 0 }}>
              {message}
            </p>
            {details && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border text-left">
                {details}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            className="px-6 py-3 text-sm font-medium text-secondary-gray bg-accent-white border border-secondary-gray rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`px-6 py-3 text-sm font-medium text-white rounded-lg transition-colors ${styles.confirmBg}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}