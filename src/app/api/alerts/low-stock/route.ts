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

    // Get low stock items using raw SQL for comparison
    const lowStockItems = await prisma.$queryRaw`
      SELECT
        i.id,
        i.name,
        i.quantity,
        i."minStock",
        c.name as category_name
      FROM inventory_items i
      JOIN categories c ON i."categoryId" = c.id
      WHERE i.quantity <= i."minStock" AND i."isActive" = true
      ORDER BY (i.quantity::float / i."minStock"::float) ASC, i.name ASC
      LIMIT 10
    ` as Array<{
      id: string
      name: string
      quantity: number
      minStock: number
      category_name: string
    }>

    const alerts = lowStockItems.map(item => {
      const stockLevel = item.quantity
      const minStock = item.minStock

      let priority = 'Low'
      let priorityColor = 'yellow'

      if (stockLevel === 0) {
        priority = 'Critical'
        priorityColor = 'red'
      } else if (stockLevel <= minStock * 0.5) {
        priority = 'Critical'
        priorityColor = 'red'
      } else if (stockLevel <= minStock * 0.8) {
        priority = 'Warning'
        priorityColor = 'orange'
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category_name,
        quantity: stockLevel,
        minStock: minStock,
        priority,
        priorityColor,
        message: stockLevel === 0
          ? 'Out of stock'
          : `Only ${stockLevel} left in stock`
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: alerts
    })

  } catch (error) {
    console.error('Low stock alerts error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}