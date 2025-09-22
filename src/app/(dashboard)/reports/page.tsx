'use client'

import { useState, useEffect } from 'react'
import { InventoryItemWithCategory, Category } from '@/types'
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { ReportContentSkeleton } from '@/components/ui/SkeletonLoader'
import * as XLSX from 'xlsx'

interface ReportData {
  lowStockItems: InventoryItemWithCategory[]
  totalItems: number
  totalValue: number
  categoryStats: { categoryName: string; count: number; value: number }[]
  recentMovements: any[]
  allItems: InventoryItemWithCategory[]
}

type ReportType = 'LOW_STOCK' | 'INVENTORY_SUMMARY' | 'CATEGORY_ANALYSIS' | 'STOCK_MOVEMENT'

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportType>('INVENTORY_SUMMARY')
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const reportTypes = [
    {
      type: 'INVENTORY_SUMMARY' as ReportType,
      name: 'Inventory Summary',
      description: 'Complete overview of all inventory items',
      icon: CubeIcon,
      color: 'bg-primary-forest'
    },
    {
      type: 'LOW_STOCK' as ReportType,
      name: 'Low Stock Report',
      description: 'Items that need restocking',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-600'
    },
    {
      type: 'CATEGORY_ANALYSIS' as ReportType,
      name: 'Category Analysis',
      description: 'Breakdown by categories',
      icon: ChartBarIcon,
      color: 'bg-primary-golden'
    },
    {
      type: 'STOCK_MOVEMENT' as ReportType,
      name: 'Stock Movements',
      description: 'Recent stock in/out activities',
      icon: ArrowTrendingUpIcon,
      color: 'bg-secondary-sage'
    }
  ]

  useEffect(() => {
    generateReport()
  }, [selectedReport, dateRange])

  const generateReport = async () => {
    setLoading(true)
    try {
      // For inventory-based reports, we need current inventory data
      // Date filtering will be applied to movements/transactions when that API is available
      const [inventoryRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory?limit=1000'), // Get all items for reports
        fetch('/api/categories')
      ])

      // For STOCK_MOVEMENT report, we would also fetch movements with date range:
      let movementsData = []
      if (selectedReport === 'STOCK_MOVEMENT') {
        try {
          const movementParams = new URLSearchParams()
          if (dateRange.from) movementParams.append('dateFrom', dateRange.from)
          if (dateRange.to) movementParams.append('dateTo', dateRange.to)
          movementParams.append('limit', '1000')

          const movementsRes = await fetch(`/api/stock-movements?${movementParams.toString()}`)
          if (movementsRes.ok) {
            const movementsResult = await movementsRes.json()
            movementsData = movementsResult.data?.movements || []
          }
        } catch (error) {
          console.log('Stock movements API not fully implemented yet')
        }
      }

      if (inventoryRes.ok && categoriesRes.ok) {
        const inventoryData = await inventoryRes.json()
        const categoriesData = await categoriesRes.json()
        
        const items = inventoryData.data.items || []
        const categories = categoriesData.data || []

        // Process data for reports
        const lowStockItems = items.filter((item: InventoryItemWithCategory) => item.quantity <= item.minStock)
        const totalValue = items.reduce((sum: number, item: InventoryItemWithCategory) => 
          sum + (parseFloat(item.unitPrice.toString()) * item.quantity), 0)
        
        const categoryStats = categories.map((category: Category) => {
          const categoryItems = items.filter((item: InventoryItemWithCategory) => item.categoryId === category.id)
          return {
            categoryName: category.name,
            count: categoryItems.length,
            value: categoryItems.reduce((sum: number, item: InventoryItemWithCategory) => 
              sum + (parseFloat(item.unitPrice.toString()) * item.quantity), 0)
          }
        })

        setReportData({
          lowStockItems,
          totalItems: items.length,
          totalValue,
          categoryStats,
          recentMovements: movementsData,
          allItems: items
        })
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!reportData) return

    const currentDate = new Date().toLocaleDateString()
    const workbook = XLSX.utils.book_new()

    switch (selectedReport) {
      case 'INVENTORY_SUMMARY':
        // Summary sheet
        const summaryData = [
          ['MNSTS Inventory Summary Report', ''],
          ['Generated on:', currentDate],
          ['', ''],
          ['OVERVIEW', ''],
          ['Total Items', reportData.totalItems],
          ['Total Value', `₱${reportData.totalValue.toLocaleString()}`],
          ['Low Stock Items', reportData.lowStockItems.length],
          ['', ''],
          ['CATEGORY BREAKDOWN', ''],
          ['Category', 'Items Count', 'Total Value'],
          ...reportData.categoryStats.map(stat => [
            stat.categoryName,
            stat.count,
            `₱${stat.value.toLocaleString()}`
          ])
        ]
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData)
        XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary')

        // Detailed items sheet
        const itemsData = [
          ['DETAILED INVENTORY ITEMS', '', '', '', '', '', ''],
          ['Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Unit Price', 'Total Value'],
          ...reportData.allItems.map(item => [
            item.name,
            item.sku,
            item.category?.name || 'No category',
            item.quantity,
            item.minStock,
            `₱${parseFloat(item.unitPrice.toString()).toLocaleString()}`,
            `₱${(parseFloat(item.unitPrice.toString()) * item.quantity).toLocaleString()}`
          ])
        ]
        const itemsWS = XLSX.utils.aoa_to_sheet(itemsData)
        XLSX.utils.book_append_sheet(workbook, itemsWS, 'All Items')
        break

      case 'LOW_STOCK':
        const lowStockData = [
          ['MNSTS Low Stock Report', ''],
          ['Generated on:', currentDate],
          ['Items requiring attention:', reportData.lowStockItems.length],
          ['', ''],
          ['Item Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Shortage'],
          ...reportData.lowStockItems.map(item => [
            item.name,
            item.sku,
            item.category?.name || 'No category',
            item.quantity,
            item.minStock,
            item.minStock - item.quantity
          ])
        ]
        const lowStockWS = XLSX.utils.aoa_to_sheet(lowStockData)
        XLSX.utils.book_append_sheet(workbook, lowStockWS, 'Low Stock Items')
        break

      case 'CATEGORY_ANALYSIS':
        const categoryData = [
          ['MNSTS Category Analysis Report', ''],
          ['Generated on:', currentDate],
          ['', ''],
          ['Category', 'Items Count', 'Total Value', 'Percentage of Total Items'],
          ...reportData.categoryStats.map(stat => [
            stat.categoryName,
            stat.count,
            `₱${stat.value.toLocaleString()}`,
            `${((stat.count / reportData.totalItems) * 100).toFixed(1)}%`
          ])
        ]
        const categoryWS = XLSX.utils.aoa_to_sheet(categoryData)
        XLSX.utils.book_append_sheet(workbook, categoryWS, 'Category Analysis')

        // Detailed breakdown by category
        reportData.categoryStats.forEach(stat => {
          const categoryItems = reportData.allItems.filter(item => item.category?.name === stat.categoryName)
          if (categoryItems.length > 0) {
            const categoryDetailData = [
              [`${stat.categoryName} - Detailed Items`, ''],
              ['Name', 'SKU', 'Current Stock', 'Min Stock', 'Unit Price', 'Total Value'],
              ...categoryItems.map(item => [
                item.name,
                item.sku,
                item.quantity,
                item.minStock,
                `₱${parseFloat(item.unitPrice.toString()).toLocaleString()}`,
                `₱${(parseFloat(item.unitPrice.toString()) * item.quantity).toLocaleString()}`
              ])
            ]
            const categoryDetailWS = XLSX.utils.aoa_to_sheet(categoryDetailData)
            XLSX.utils.book_append_sheet(workbook, categoryDetailWS, stat.categoryName.substring(0, 30))
          }
        })
        break

      case 'STOCK_MOVEMENT':
        const movementData = [
          ['MNSTS Stock Movement Report', ''],
          ['Generated on:', currentDate],
          ['Date Range:', `${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}`],
          ['Total Movements Found:', reportData.recentMovements.length],
          ['', '']
        ]

        if (reportData.recentMovements.length > 0) {
          movementData.push(
            ['STOCK MOVEMENTS', '', '', '', ''],
            ['Date', 'Type', 'Item Name', 'SKU', 'Quantity', 'Reason', 'Notes'],
            ...reportData.recentMovements.map((movement: any) => [
              new Date(movement.createdAt).toLocaleDateString(),
              movement.type,
              movement.item?.name || 'Unknown Item',
              movement.item?.sku || 'N/A',
              movement.quantity,
              movement.reason,
              movement.notes || ''
            ])
          )
          movementData.push(['', ''], ['CURRENT INVENTORY STATUS', '', '', '', ''])
        } else {
          movementData.push(
            ['No movements found for the selected date range', ''],
            ['', ''],
            ['CURRENT INVENTORY STATUS', '', '', '', '']
          )
        }

        movementData.push(
          ['Item Name', 'SKU', 'Category', 'Current Stock', 'Status'],
          ...reportData.allItems.map(item => [
            item.name,
            item.sku,
            item.category?.name || 'No category',
            item.quantity,
            item.quantity === 0 ? 'Out of Stock' :
            item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'
          ])
        )

        const movementWS = XLSX.utils.aoa_to_sheet(movementData)
        XLSX.utils.book_append_sheet(workbook, movementWS, 'Stock Movement')
        break
    }

    // Download the Excel file
    const fileName = `MNSTS_${selectedReport.toLowerCase()}_report_${currentDate.replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const renderReportContent = () => {
    if (!reportData) return null

    switch (selectedReport) {
      case 'INVENTORY_SUMMARY':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
                <h3 className="text-lg font-semibold text-primary-forest mb-2">Total Items</h3>
                <p className="text-3xl font-bold text-primary-forest">{reportData.totalItems}</p>
              </div>
              <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
                <h3 className="text-lg font-semibold text-primary-forest mb-2">Total Value</h3>
                <p className="text-3xl font-bold text-primary-forest">₱{reportData.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
                <h3 className="text-lg font-semibold text-primary-forest mb-2">Low Stock</h3>
                <p className="text-3xl font-bold text-red-600">{reportData.lowStockItems.length}</p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Category Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-secondary-sage/20">
                      <th className="py-2 font-semibold text-primary-forest">Category</th>
                      <th className="py-2 font-semibold text-primary-forest">Items</th>
                      <th className="py-2 font-semibold text-primary-forest">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.categoryStats.map((stat, index) => (
                      <tr key={index} className="border-b border-secondary-sage/10">
                        <td className="py-3">{stat.categoryName}</td>
                        <td className="py-3">{stat.count}</td>
                        <td className="py-3">₱{stat.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* All Inventory Items */}
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">All Inventory Items ({reportData.allItems.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-secondary-sage/20">
                      <th className="py-2 font-semibold text-primary-forest">Item Name</th>
                      <th className="py-2 font-semibold text-primary-forest">SKU</th>
                      <th className="py-2 font-semibold text-primary-forest">Category</th>
                      <th className="py-2 font-semibold text-primary-forest">Current Stock</th>
                      <th className="py-2 font-semibold text-primary-forest">Min Stock</th>
                      <th className="py-2 font-semibold text-primary-forest">Unit Price</th>
                      <th className="py-2 font-semibold text-primary-forest">Total Value</th>
                      <th className="py-2 font-semibold text-primary-forest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.allItems.map((item, index) => (
                      <tr key={index} className="border-b border-secondary-sage/10">
                        <td className="py-3 font-medium">{item.name}</td>
                        <td className="py-3 text-secondary-gray">{item.sku}</td>
                        <td className="py-3">
                          {item.category ? (
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.category.color }}
                              ></div>
                              {item.category.name}
                            </div>
                          ) : (
                            <span className="text-secondary-gray">No category</span>
                          )}
                        </td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">{item.minStock}</td>
                        <td className="py-3">₱{parseFloat(item.unitPrice.toString()).toLocaleString()}</td>
                        <td className="py-3 font-medium">₱{(parseFloat(item.unitPrice.toString()) * item.quantity).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.quantity === 0
                              ? 'bg-red-100 text-red-800'
                              : item.quantity <= item.minStock
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' :
                             item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'LOW_STOCK':
        return (
          <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
            <h3 className="text-lg font-semibold text-primary-forest mb-4">
              Items Requiring Attention ({reportData.lowStockItems.length})
            </h3>
            {reportData.lowStockItems.length === 0 ? (
              <p className="text-secondary-gray text-center py-8">No low stock items found!</p>
            ) : (
              <div className="space-y-4">
                {reportData.lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h4 className="font-medium text-red-800">{item.name}</h4>
                      <p className="text-sm text-red-600">SKU: {item.sku} | Category: {item.category?.name || 'No category'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-800">Current: {item.quantity}</p>
                      <p className="text-sm text-red-600">Min: {item.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'CATEGORY_ANALYSIS':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Items by Category</h3>
              <div className="space-y-3">
                {reportData.categoryStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-secondary-gray">{stat.categoryName}</span>
                    <span className="font-semibold text-primary-forest">{stat.count} items</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Value by Category</h3>
              <div className="space-y-3">
                {reportData.categoryStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-secondary-gray">{stat.categoryName}</span>
                    <span className="font-semibold text-primary-forest">₱{stat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'STOCK_MOVEMENT':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h3 className="text-lg font-semibold text-primary-forest mb-4">Stock Movement Report</h3>
              <p className="text-sm text-secondary-gray mb-4">
                Date Range: {dateRange.from || 'All time'} to {dateRange.to || 'Present'}
              </p>

              {reportData.recentMovements.length > 0 ? (
                <div>
                  <h4 className="text-lg font-semibold text-primary-forest mb-4">
                    Recent Movements ({reportData.recentMovements.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-secondary-sage/20">
                          <th className="py-2 font-semibold text-primary-forest">Date</th>
                          <th className="py-2 font-semibold text-primary-forest">Type</th>
                          <th className="py-2 font-semibold text-primary-forest">Item</th>
                          <th className="py-2 font-semibold text-primary-forest">Quantity</th>
                          <th className="py-2 font-semibold text-primary-forest">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.recentMovements.slice(0, 20).map((movement: any, index: number) => (
                          <tr key={index} className="border-b border-secondary-sage/10">
                            <td className="py-3">{new Date(movement.createdAt).toLocaleDateString()}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                movement.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {movement.type}
                              </span>
                            </td>
                            <td className="py-3">{movement.item?.name || 'Unknown Item'}</td>
                            <td className="py-3">{movement.quantity}</td>
                            <td className="py-3">{movement.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {reportData.recentMovements.length > 20 && (
                    <p className="text-sm text-secondary-gray mt-2 text-center">
                      Showing first 20 movements. Export report to see all movements.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ArrowTrendingUpIcon className="w-16 h-16 text-secondary-gray/50 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-secondary-gray mb-2">No Stock Movements Found</h4>
                  <p className="text-secondary-gray mb-4">
                    No stock movements found for the selected date range.
                  </p>
                  <p className="text-sm text-secondary-gray">
                    Try selecting a different date range or check if there are any stock movements recorded.
                  </p>
                </div>
              )}
            </div>

            {/* Current Inventory Status */}
            <div className="bg-accent-white rounded-lg p-6 border border-secondary-sage/10">
              <h4 className="text-lg font-semibold text-primary-forest mb-4">Current Inventory Status</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-secondary-sage/20">
                      <th className="py-2 font-semibold text-primary-forest">Item</th>
                      <th className="py-2 font-semibold text-primary-forest">SKU</th>
                      <th className="py-2 font-semibold text-primary-forest">Category</th>
                      <th className="py-2 font-semibold text-primary-forest">Current Stock</th>
                      <th className="py-2 font-semibold text-primary-forest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.allItems.slice(0, 10).map((item, index) => (
                      <tr key={index} className="border-b border-secondary-sage/10">
                        <td className="py-3">{item.name}</td>
                        <td className="py-3">{item.sku}</td>
                        <td className="py-3">{item.category?.name || 'No category'}</td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.quantity === 0
                              ? 'bg-red-100 text-red-800'
                              : item.quantity <= item.minStock
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity === 0 ? 'Out of Stock' :
                             item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.allItems.length > 10 && (
                <p className="text-sm text-secondary-gray mt-2 text-center">
                  Showing first 10 items. Export report to see all items.
                </p>
              )}
            </div>
          </div>
        )

      default:
        return <p className="text-center text-secondary-gray py-8">Select a report type to view data</p>
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-forest">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-secondary-gray">Generate and view detailed reports</p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {reportTypes.map(report => {
            const Icon = report.icon
            return (
              <button
                key={report.type}
                onClick={() => setSelectedReport(report.type)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                  selectedReport === report.type
                    ? 'border-primary-forest bg-primary-forest/5'
                    : 'border-secondary-sage/20 hover:border-primary-forest/50'
                }`}
              >
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${report.color}`}>
                  <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="font-semibold text-primary-forest mb-1 text-sm sm:text-base">{report.name}</h3>
                <p className="text-xs sm:text-sm text-secondary-gray">{report.description}</p>
              </button>
            )
          })}
        </div>

        {/* Report Controls */}
        <div className="bg-accent-white rounded-lg p-4 sm:p-6 border border-secondary-sage/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="px-3 sm:px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-primary-forest mb-2">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="px-3 sm:px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-end">
                <div className="text-xs text-secondary-gray bg-secondary-sage/10 px-3 py-2 rounded-lg">
                  <p className="font-medium mb-1">Date Filter Info:</p>
                  <p>• Inventory reports show current stock</p>
                  <p>• Stock movements filtered by date range</p>
                  {selectedReport === 'STOCK_MOVEMENT' && (
                    <p className="text-primary-forest font-medium mt-1">✓ Date filtering active</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={generateReport}
                disabled={loading}
                className="bg-primary-forest text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-secondary-teal transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={exportReport}
                disabled={!reportData}
                className="bg-primary-golden text-primary-forest px-4 sm:px-6 py-2 rounded-lg hover:bg-accent-lightGold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <DocumentArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <ReportContentSkeleton />
        ) : (
          renderReportContent()
        )}

    </div>
  )
}