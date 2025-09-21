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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(category && { categoryId: category })
    }

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
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
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.inventoryItem.count({ where })
    ])

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Inventory fetch error:', error)
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

    const existingSku = await prisma.inventoryItem.findUnique({
      where: { sku }
    })

    if (existingSku) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'An item with this SKU already exists'
      }, { status: 400 })
    }

    const item = await prisma.inventoryItem.create({
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
        createdBy: user.id,
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

    // Log the initial stock entry
    await prisma.stockMovement.create({
      data: {
        type: 'IN',
        quantity: parseInt(quantity),
        reason: 'Initial stock',
        notes: 'Item added to inventory',
        itemId: item.id,
        userId: user.id
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    })

  } catch (error) {
    console.error('Inventory creation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}