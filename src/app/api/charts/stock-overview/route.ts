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

    // Get last 6 months of data
    const monthsAgo = new Date()
    monthsAgo.setMonth(monthsAgo.getMonth() - 5) // 6 months including current

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const stockData = []

    for (let i = 0; i < 6; i++) {
      const currentDate = new Date()
      currentDate.setMonth(currentDate.getMonth() - (5 - i))

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      // Get total items at end of month (current quantities)
      const totalItems = await prisma.inventoryItem.aggregate({
        _sum: {
          quantity: true
        },
        where: {
          createdAt: {
            lte: endOfMonth
          }
        }
      })

      // Get low stock items at end of month using raw SQL
      const lowStockResult = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM inventory_items
        WHERE "createdAt" <= ${endOfMonth}
        AND quantity <= "minStock"
        AND "isActive" = true
      ` as Array<{ count: bigint }>

      const lowStockItems = Number(lowStockResult[0]?.count || 0)

      stockData.push({
        month: monthNames[currentDate.getMonth()],
        inStock: totalItems._sum.quantity || 0,
        lowStock: lowStockItems
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stockData
    })

  } catch (error) {
    console.error('Stock overview chart error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}