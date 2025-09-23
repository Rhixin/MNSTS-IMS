import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'
import { MovementType } from '@prisma/client'
import { sendLowStockAlert, LowStockItem } from '@/lib/email'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get stock movements with basic data
    const movements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.stockMovement.count()

    // Get unique item IDs and user IDs
    const itemIds = [...new Set(movements.map(m => m.itemId))]
    const userIds = [...new Set(movements.map(m => m.userId))]

    // Fetch items and users separately to avoid complex joins
    const [items, users] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { id: { in: itemIds } },
        select: {
          id: true,
          name: true,
          sku: true,
          categoryId: true
        }
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      })
    ])

    // Get unique category IDs and fetch categories
    const categoryIds = [...new Set(items.map(i => i.categoryId).filter(Boolean))]
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: {
        id: true,
        name: true,
        color: true
      }
    })

    // Create lookup maps for better performance
    const itemMap = new Map(items.map(item => [item.id, item]))
    const userMap = new Map(users.map(user => [user.id, user]))
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

    // Transform data with real information
    const transformedMovements = movements.map(movement => {
      const item = itemMap.get(movement.itemId)
      const user = userMap.get(movement.userId)
      const category = item?.categoryId ? categoryMap.get(item.categoryId) : null

      return {
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason || '',
        notes: movement.notes || '',
        createdAt: movement.createdAt,
        item: {
          id: movement.itemId,
          name: item?.name || 'Unknown Item',
          sku: item?.sku || 'Unknown SKU',
          category: category ? {
            name: category.name,
            color: category.color
          } : null
        },
        user: {
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'User'
        }
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        movements: transformedMovements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { itemId, type, quantity, reason, notes } = await request.json()

    if (!itemId || !type || !quantity || !reason) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    if (!['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'].includes(type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid movement type'
      }, { status: 400 })
    }

    if (quantity <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Quantity must be positive'
      }, { status: 400 })
    }

    // Get current item
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    // Calculate new quantity
    let newQuantity: number
    if (type === 'IN' || type === 'ADJUSTMENT') {
      newQuantity = item.quantity + quantity
    } else if (type === 'OUT' || type === 'TRANSFER') {
      newQuantity = item.quantity - quantity
      if (newQuantity < 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Insufficient stock'
        }, { status: 400 })
      }
    } else {
      newQuantity = item.quantity
    }

    // Create stock movement and update item in a transaction
    const result = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          itemId,
          userId: user.id,
          type: type as MovementType,
          quantity,
          reason,
          notes
        },
        include: {
          item: {
            include: {
              category: true
            }
          },
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: newQuantity }
      })
    ])

    // Check for low stock after OUT movements and send email alerts
    if ((type === 'OUT' || type === 'TRANSFER') && newQuantity <= item.minStock) {
      try {
        // Get all items that are now below minimum stock (including this one)
        const allItems = await prisma.inventoryItem.findMany({
          where: {
            isActive: true
          },
          include: {
            category: true
          }
        })

        const lowStockItems = allItems.filter(item => item.quantity <= item.minStock)

        if (lowStockItems.length > 0) {
          const lowStockData: LowStockItem[] = lowStockItems.map(item => ({
            name: item.name,
            sku: item.sku,
            category: item.category?.name || 'No category',
            currentStock: item.quantity,
            minStock: item.minStock,
            shortage: Math.max(0, item.minStock - item.quantity)
          }))

          // Send low stock alert emails (don't await to avoid blocking the response)
          sendLowStockAlert(lowStockData).catch(() => {
            // Silently handle email errors to avoid blocking the stock movement
          })
        }
      } catch (error) {
        // Don't fail the stock movement if email fails - silently continue
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Stock movement recorded successfully',
      data: result[0]
    })

  } catch (error) {
    console.error('Stock movement creation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}