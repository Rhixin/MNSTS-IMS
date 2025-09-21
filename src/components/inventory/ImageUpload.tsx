'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import ImageViewer from '@/components/ui/ImageViewer'

interface ImageUploadProps {
  imageUrls: string[]
  onImagesChange: (urls: string[]) => void
  maxImages?: number
  onError?: (title: string, message: string) => void
  onWarning?: (title: string, message: string) => void
}

export default function ImageUpload({
  imageUrls,
  onImagesChange,
  maxImages = 5,
  onError,
  onWarning
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [dragActive, setDragActive] = useState(false)
  const [imageViewer, setImageViewer] = useState({ isOpen: false, index: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - imageUrls.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      onWarning?.('Maximum Images Reached', `Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress for better UX
        const progressKey = `${file.name}_${index}`
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }))

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [progressKey]: Math.min((prev[progressKey] || 0) + 10, 90)
          }))
        }, 200)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          const result = await response.json()
          
          clearInterval(progressInterval)
          setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }))

          if (result.success) {
            return result.data.url
          } else {
            throw new Error(result.error || 'Upload failed')
          }
        } catch (error) {
          clearInterval(progressInterval)
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[progressKey]
            return newProgress
          })
          throw error
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImageUrls = [...imageUrls, ...uploadedUrls.filter(url => url)]
      
      onImagesChange(newImageUrls)
      
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({})
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      onError?.('Upload Failed', 'Some images failed to upload. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index)
    onImagesChange(newImageUrls)
  }

  const handleImageClick = (index: number) => {
    setImageViewer({ isOpen: true, index })
  }

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    const newImageUrls = [...imageUrls]
    const [moved] = newImageUrls.splice(fromIndex, 1)
    newImageUrls.splice(toIndex, 0, moved)
    onImagesChange(newImageUrls)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files) {
      handleFileSelect(files)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-primary-forest">
          Item Images ({imageUrls.length}/{maxImages})
        </label>
        {imageUrls.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-primary-golden text-primary-forest px-4 py-2 rounded-lg hover:bg-accent-lightGold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{uploading ? 'Uploading...' : 'Add Images'}</span>
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      {imageUrls.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-primary-forest bg-primary-cream/70 scale-105'
              : 'border-secondary-gray hover:border-primary-forest hover:bg-primary-cream/50'
          }`}
        >
          <svg className={`w-12 h-12 mx-auto mb-4 transition-colors ${
            dragActive ? 'text-primary-forest' : 'text-secondary-gray'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-secondary-gray mb-2">
            {dragActive ? (
              <span className="text-primary-forest font-medium">Drop images here!</span>
            ) : (
              <>Drag & drop images here, or <span className="text-primary-forest font-medium">click to browse</span></>
            )}
          </p>
          <p className="text-sm text-secondary-gray">
            Support: JPEG, PNG, GIF, WebP (Max 5MB each, up to {maxImages} images)
          </p>
        </div>
      )}

      {/* Image preview grid */}
      {imageUrls.length > 0 && (
        <div>
          {/* Drag and drop zone for existing images */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-4 mb-4 transition-all duration-200 ${
              dragActive
                ? 'border-primary-forest bg-primary-cream/50'
                : 'border-transparent'
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div
                    className="aspect-square rounded-lg overflow-hidden border-2 border-secondary-sage/20 relative cursor-pointer hover:border-primary-forest transition-colors"
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={url}
                      alt={`Item image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage(index)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Primary badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="bg-primary-forest text-accent-white px-2 py-1 text-xs rounded-full">
                        Primary
                      </span>
                    </div>
                  )}

                  {/* Reorder buttons */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReorderImages(index, index - 1)
                        }}
                        className="bg-primary-forest text-white rounded-full p-1 hover:bg-secondary-teal"
                        title="Move left"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {index < imageUrls.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReorderImages(index, index + 1)
                        }}
                        className="bg-primary-forest text-white rounded-full p-1 hover:bg-secondary-teal"
                        title="Move right"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add more button */}
              {imageUrls.length < maxImages && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-lg border-2 border-dashed border-secondary-gray hover:border-primary-forest hover:bg-primary-cream/50 transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-8 h-8 text-secondary-gray mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-secondary-gray">Add Image</span>
                </button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="text-sm text-secondary-gray space-y-1">
            <p>• Click on an image to view it in full size</p>
            <p>• Use the arrow buttons to reorder images</p>
            <p>• The first image will be used as the primary image</p>
            <p>• Drag & drop more images anywhere in the grid area</p>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="bg-primary-cream rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-primary-forest">
                  Uploading {key.split('_')[0]}
                </span>
                <span className="text-sm text-secondary-gray">{progress}%</span>
              </div>
              <div className="w-full bg-secondary-gray/20 rounded-full h-2">
                <div
                  className="bg-primary-forest h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={imageViewer.isOpen}
        onClose={() => setImageViewer({ isOpen: false, index: 0 })}
        images={imageUrls}
        initialIndex={imageViewer.index}
        title="Item Images"
      />
    </div>
  )
}