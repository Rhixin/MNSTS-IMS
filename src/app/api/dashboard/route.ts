import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    // Get all necessary data in parallel for better performance
    const [
      totalItems,
      inventoryItems,
      categories,
      recentMovements,
      lowStockItems,
      stockMovementCount
    ] = await Promise.all([
      // Total number of items
      prisma.inventoryItem.count({ where: { isActive: true } }),
      
      // All inventory items with categories for calculations
      prisma.inventoryItem.findMany({
        where: { isActive: true },
        include: { category: true }
      }),
      
      // Categories with item counts
      prisma.category.findMany({
        include: {
          _count: {
            select: { inventoryItems: { where: { isActive: true } } }
          }
        }
      }),
      
      // Recent stock movements (last 7 days)
      prisma.stockMovement.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          item: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Low stock items
      prisma.inventoryItem.findMany({
        where: {
          AND: [
            { isActive: true },
            { quantity: { lte: prisma.inventoryItem.fields.minStock } }
          ]
        },
        include: { category: true },
        orderBy: { quantity: 'asc' }
      }),
      
      // Total stock movements in last 30 days
      prisma.stockMovement.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate total inventory value
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (parseFloat(item.unitPrice.toString()) * item.quantity), 0
    )

    // Calculate category statistics
    const categoryStats = categories.map(category => {
      const categoryItems = inventoryItems.filter(item => item.categoryId === category.id)
      const categoryValue = categoryItems.reduce((sum, item) => 
        sum + (parseFloat(item.unitPrice.toString()) * item.quantity), 0
      )
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        itemCount: categoryItems.length,
        totalValue: categoryValue,
        percentage: totalItems > 0 ? Math.round((categoryItems.length / totalItems) * 100) : 0
      }
    })

    // Calculate stock levels distribution
    const stockLevels = {
      outOfStock: inventoryItems.filter(item => item.quantity === 0).length,
      lowStock: inventoryItems.filter(item => item.quantity > 0 && item.quantity <= item.minStock).length,
      normalStock: inventoryItems.filter(item => item.quantity > item.minStock && item.quantity < item.maxStock).length,
      overStock: inventoryItems.filter(item => item.quantity >= item.maxStock).length
    }

    // Calculate monthly trends (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - i)
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)

      const [stockInCount, stockOutCount] = await Promise.all([
        prisma.stockMovement.count({
          where: {
            type: 'IN',
            createdAt: { gte: startDate, lt: endDate }
          }
        }),
        prisma.stockMovement.count({
          where: {
            type: 'OUT', 
            createdAt: { gte: startDate, lt: endDate }
          }
        })
      ])

      monthlyData.push({
        month: startDate.toLocaleDateString('en-US', { month: 'short' }),
        stockIn: stockInCount,
        stockOut: stockOutCount
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        summary: {
          totalItems,
          lowStockItems: lowStockItems.length,
          totalValue,
          recentMovements: stockMovementCount,
          outOfStockItems: stockLevels.outOfStock
        },
        categoryStats,
        stockLevels,
        monthlyTrends: monthlyData,
        recentMovements: recentMovements.map(movement => ({
          id: movement.id,
          type: movement.type,
          quantity: movement.quantity,
          itemName: movement.item.name,
          user: `${movement.user.firstName} ${movement.user.lastName}`,
          createdAt: movement.createdAt,
          reason: movement.reason
        })),
        lowStockAlerts: lowStockItems.slice(0, 5).map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          currentStock: item.quantity,
          minStock: item.minStock,
          category: item.category.name,
          urgency: item.quantity === 0 ? 'critical' : item.quantity <= Math.floor(item.minStock * 0.5) ? 'high' : 'medium'
        }))
      }
    })

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}