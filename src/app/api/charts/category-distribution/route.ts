import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
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
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Get categories with their item counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            inventoryItems: true
          }
        }
      }
    })

    // Calculate total items
    const totalItems = categories.reduce((sum, category) => sum + category._count.inventoryItems, 0)

    // Prepare chart data with colors
    const colors = ['#2D5F3F', '#F4C430', '#87A96B', '#1B4B47', '#6B6B6B', '#4F46E5', '#EF4444', '#10B981']

    const categoryData = categories.map((category, index) => ({
      name: category.name,
      value: totalItems > 0 ? Math.round((category._count.inventoryItems / totalItems) * 100) : 0,
      color: category.color || colors[index % colors.length],
      count: category._count.inventoryItems
    }))

    // Filter out categories with 0 items and sort by count
    const filteredData = categoryData
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: filteredData
    })

  } catch (error) {
    console.error('Category distribution chart error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}