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

    const categories = await prisma.category.findMany({
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
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
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

    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category name is required'
      }, { status: 400 })
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Category with this name already exists'
      }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#6B7280'
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Category created successfully',
      data: category
    })

  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}