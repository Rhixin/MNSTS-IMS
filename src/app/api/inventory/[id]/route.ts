import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        stockMovements: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!item) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('Item fetch error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    const {
      name,
      description,
      sku,
      barcode,
      quantity,
      minStock,
      maxStock,
      unitPrice,
      location,
      categoryId,
      imageUrls
    } = await request.json()

    if (!name || !sku || !categoryId || quantity === undefined || !unitPrice) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Required fields: name, sku, categoryId, quantity, unitPrice'
      }, { status: 400 })
    }

    // Check if SKU is unique (excluding current item)
    if (sku !== existingItem.sku) {
      const existingSku = await prisma.inventoryItem.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'An item with this SKU already exists'
        }, { status: 400 })
      }
    }

    // Track quantity changes
    const quantityDiff = parseInt(quantity) - existingItem.quantity
    if (quantityDiff !== 0) {
      await prisma.stockMovement.create({
        data: {
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          reason: 'Stock adjustment',
          notes: `Quantity updated from ${existingItem.quantity} to ${quantity}`,
          itemId: id,
          userId: user.id
        }
      })
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        barcode,
        quantity: parseInt(quantity),
        minStock: parseInt(minStock) || 5,
        maxStock: parseInt(maxStock) || 100,
        unitPrice: parseFloat(unitPrice),
        location,
        categoryId,
        imageUrls: imageUrls || []
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    })

  } catch (error) {
    console.error('Item update error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Item not found'
      }, { status: 404 })
    }

    // Soft delete by setting isActive to false
    await prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false }
    })

    // Log the deletion
    await prisma.stockMovement.create({
      data: {
        type: 'OUT',
        quantity: item.quantity,
        reason: 'Item deleted',
        notes: 'Item removed from inventory',
        itemId: id,
        userId: user.id
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error) {
    console.error('Item deletion error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}