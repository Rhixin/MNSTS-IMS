import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { name, description, color } = await request.json()
    const { id: categoryId } = await params

    if (!name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category name is required'
      }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!existingCategory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category not found'
      }, { status: 404 })
    }

    // Check if name is already taken by another category
    const duplicateCategory = await prisma.category.findFirst({
      where: { 
        name,
        NOT: { id: categoryId }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category with this name already exists'
      }, { status: 400 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        color: color || '#6B7280'
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    })

  } catch (error) {
    console.error('Category update error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: categoryId } = await params

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            inventoryItems: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category not found'
      }, { status: 404 })
    }

    // Check if category has active inventory items
    if (existingCategory._count.inventoryItems > 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Cannot delete category. It contains ${existingCategory._count.inventoryItems} active items. Please reassign or delete those items first.`
      }, { status: 400 })
    }

    // Set categoryId to null for inactive items before deleting the category
    await prisma.$executeRaw`
      UPDATE "inventory_items"
      SET "categoryId" = NULL
      WHERE "categoryId" = ${categoryId} AND "isActive" = false
    `

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Category deletion error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}