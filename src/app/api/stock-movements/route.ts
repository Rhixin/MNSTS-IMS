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
    const limit = parseInt(searchParams.get('limit') || '10')
    const itemId = searchParams.get('itemId')
    const type = searchParams.get('type') as MovementType | null
    const reason = searchParams.get('reason')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where = {
      ...(itemId && { itemId }),
      ...(type && { type }),
      ...(reason && {
        reason: {
          contains: reason,
          mode: 'insensitive' as const
        }
      }),
      ...((dateFrom || dateTo) && {
        createdAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(`${dateTo}T23:59:59.999Z`) })
        }
      })
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          item: {
            include: {
              category: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.stockMovement.count({ where })
    ])


    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Stock movements fetch error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
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