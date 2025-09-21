import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'
import { sendLowStockAlert, LowStockItem } from '@/lib/email'

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

    // Get all items that are below minimum stock
    const lowStockItems = await prisma.$queryRaw`
      SELECT
        i.*,
        c.name as categoryName,
        c.color as categoryColor
      FROM "InventoryItem" i
      JOIN "Category" c ON i."categoryId" = c.id
      WHERE i.quantity <= i."minStock"
      AND i."isActive" = true
    ` as any[]

    if (lowStockItems.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'No low stock items found',
        data: { lowStockItems: [] }
      })
    }

    const lowStockData: LowStockItem[] = lowStockItems.map(item => ({
      name: item.name,
      sku: item.sku,
      category: item.categoryName,
      currentStock: item.quantity,
      minStock: item.minStock,
      shortage: Math.max(0, item.minStock - item.quantity)
    }))

    // Send low stock alert emails
    const emailResult = await sendLowStockAlert(lowStockData)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Test alert completed. ${emailResult.message}`,
      data: {
        lowStockItems: lowStockData,
        emailResult
      }
    })

  } catch (error) {
    console.error('Test low stock alert error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}