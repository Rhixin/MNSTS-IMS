'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 animate-pulse'

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} h-4 mb-2 ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Item Card Skeleton
export function ItemCardSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton variant="text" className="h-5" />

        {/* SKU */}
        <Skeleton variant="text" className="h-3 w-2/3" />

        {/* Category and stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
          <Skeleton variant="text" className="h-3 w-12" />
        </div>

        {/* Price and quantity */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-20" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <Skeleton className="flex-1 h-8 rounded-md" />
          <Skeleton className="flex-1 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Item Details Skeleton
export function ItemDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div>
            <Skeleton variant="text" className="h-6 w-48 mb-2" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="w-20 h-10 rounded-lg" />
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images Section */}
        <div className="lg:col-span-1">
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-16 mb-4" />
            {/* Primary Image */}
            <Skeleton className="aspect-square rounded-lg mb-4" />
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-32 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton variant="text" className="h-3 w-16 mb-1" />
                    <Skeleton variant="text" className="h-4 w-32" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton variant="text" className="h-3 w-20 mb-1" />
                    <Skeleton variant="text" className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <Skeleton variant="text" className="h-3 w-20 mb-1" />
              <Skeleton variant="text" lines={3} />
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-32 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center">
                  <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-3" />
                  <Skeleton variant="text" className="h-3 w-20 mx-auto mb-1" />
                  <Skeleton variant="text" className="h-6 w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inventory Grid Skeleton
export function InventoryGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ItemCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Stats Cards Skeleton
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="text" className="h-3 w-20 mb-2" />
              <Skeleton variant="text" className="h-6 w-12" />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
        </div>
      ))}
    </div>
  )
}

// Filters Skeleton
export function FiltersSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton variant="text" className="h-3 w-20 mb-2" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex space-x-2">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Skeleton variant="text" className="h-5 w-32" />
        <Skeleton variant="text" lines={2} className="w-full" />

        {/* Stats */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton variant="text" className="h-4 w-12" />
          <Skeleton variant="text" className="h-4 w-8" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </div>
    </div>
  )
}

// Category Grid Skeleton
export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Dashboard Stat Card Skeleton
export function DashboardStatSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton variant="text" className="h-4 w-20 mb-2" />
          <Skeleton variant="text" className="h-8 w-16" />
        </div>
        <Skeleton variant="circular" width={56} height={56} />
      </div>
    </div>
  )
}

// Dashboard Stats Grid Skeleton
export function DashboardStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <DashboardStatSkeleton key={index} />
      ))}
    </div>
  )
}

// Chart Card Skeleton
export function ChartCardSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <div className="mb-4">
        <Skeleton variant="text" className="h-6 w-32 mb-2" />
        <Skeleton variant="text" className="h-4 w-48" />
      </div>
      <Skeleton className={`w-full ${height} rounded-lg`} />
    </div>
  )
}

// Quick Actions Skeleton
export function QuickActionsSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <Skeleton variant="text" className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg border border-gray-200">
            <Skeleton variant="circular" width={24} height={24} className="mx-auto mb-2" />
            <Skeleton variant="text" className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Alerts Panel Skeleton
export function AlertsPanelSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <Skeleton variant="text" className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Skeleton variant="text" className="h-4 w-32 mb-1" />
              <Skeleton variant="text" className="h-3 w-24" />
            </div>
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Complete Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <Skeleton variant="text" className="h-8 w-32 mb-2" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Dashboard Stats */}
      <DashboardStatsGridSkeleton />

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      {/* Full Width Chart */}
      <ChartCardSkeleton height="h-80" />

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsSkeleton />
        <AlertsPanelSkeleton />
      </div>
    </div>
  )
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
      <Skeleton variant="text" className="h-6 w-32 mb-6" />

      <div className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton variant="text" className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <div>
            <Skeleton variant="text" className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Skeleton variant="text" className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <div>
            <Skeleton variant="text" className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
        </div>

        <div>
          <Skeleton variant="text" className="h-4 w-20 mb-2" />
          <Skeleton className="h-24 rounded-lg" />
        </div>

        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  )
}

// Stock Page Skeleton
export function StockPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton variant="text" className="h-8 w-32 mb-2" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <FormSkeleton />
        </div>

        {/* Stats Panel */}
        <div className="space-y-6">
          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-24 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index}>
                  <Skeleton variant="text" className="h-3 w-20 mb-1" />
                  <Skeleton variant="text" className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-28 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <Skeleton variant="text" className="h-4 w-32 mb-1" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-secondary-sage/10">
      <td className="py-4 px-6">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="space-y-1">
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="text" className="h-3 w-24" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </td>
      <td className="py-4 px-6">
        <Skeleton variant="text" className="h-4 w-12" />
      </td>
      <td className="py-4 px-6">
        <Skeleton variant="text" className="h-4 w-24" />
      </td>
      <td className="py-4 px-6">
        <Skeleton variant="text" className="h-4 w-20" />
      </td>
      <td className="py-4 px-6">
        <Skeleton variant="text" className="h-4 w-28" />
      </td>
    </tr>
  )
}

// Stock History Page Skeleton
export function StockHistoryPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton variant="text" className="h-8 w-48 mb-2" />
          <Skeleton variant="text" className="h-4 w-64" />
        </div>
        <Skeleton className="w-24 h-12 rounded-lg" />
      </div>

      {/* Filters (Optional - can be shown or hidden) */}
      <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index}>
              <Skeleton variant="text" className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Movement Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-accent-white rounded-xl shadow-sm p-6 border border-secondary-sage/10">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton variant="text" className="h-4 w-20 mb-2" />
                <Skeleton variant="text" className="h-6 w-8" />
              </div>
              <Skeleton variant="circular" width={48} height={48} />
            </div>
          </div>
        ))}
      </div>

      {/* Movements Table */}
      <div className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-cream/50 border-b border-secondary-sage/20">
              <tr>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-16" />
                </th>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-12" />
                </th>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-20" />
                </th>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-16" />
                </th>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-12" />
                </th>
                <th className="text-left py-4 px-6">
                  <Skeleton variant="text" className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-sage/10">
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-sage/10">
          <Skeleton variant="text" className="h-4 w-20" />
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Reports Page Skeleton
export function ReportsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton variant="text" className="h-8 w-48 mb-2" />
        <Skeleton variant="text" className="h-4 w-64" />
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg border-2 border-secondary-sage/20">
            <Skeleton variant="circular" width={32} height={32} className="mb-3" />
            <Skeleton variant="text" className="h-5 w-32 mb-1" />
            <Skeleton variant="text" className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Report Controls */}
      <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <Skeleton variant="text" className="h-4 w-20 mb-2" />
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <div>
              <Skeleton variant="text" className="h-4 w-16 mb-2" />
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-32 h-10 rounded-lg" />
            <Skeleton className="w-24 h-10 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <Skeleton variant="text" className="h-5 w-24 mb-2" />
              <Skeleton variant="text" className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* Report Table/Content */}
        <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
          <Skeleton variant="text" className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-secondary-sage/10">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="text" className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-primary-golden/10 to-secondary-sage/10 rounded-lg p-6 border border-secondary-sage/20">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-accent-white rounded-lg p-4">
                <Skeleton variant="text" className="h-4 w-40 mb-2" />
                <Skeleton variant="text" lines={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Report Content Skeleton (for just the content section)
export function ReportContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
            <Skeleton variant="text" className="h-5 w-24 mb-2" />
            <Skeleton variant="text" className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Report Table/Content */}
      <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
        <Skeleton variant="text" className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center py-3 border-b border-secondary-sage/10">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Skeleton }