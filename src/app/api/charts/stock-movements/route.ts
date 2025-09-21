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

    // Get last 7 days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const movementData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

      // Get inbound movements (IN, ADJUSTMENT with positive quantity)
      const inboundMovements = await prisma.stockMovement.aggregate({
        _sum: {
          quantity: true
        },
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          OR: [
            { type: 'IN' },
            {
              type: 'ADJUSTMENT',
              quantity: {
                gt: 0
              }
            }
          ]
        }
      })

      // Get outbound movements (OUT, ADJUSTMENT with negative quantity)
      const outboundMovements = await prisma.stockMovement.aggregate({
        _sum: {
          quantity: true
        },
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          OR: [
            { type: 'OUT' },
            {
              type: 'ADJUSTMENT',
              quantity: {
                lt: 0
              }
            }
          ]
        }
      })

      movementData.push({
        day: dayNames[date.getDay()],
        inbound: inboundMovements._sum.quantity || 0,
        outbound: Math.abs(outboundMovements._sum.quantity || 0) // Make outbound positive for display
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: movementData
    })

  } catch (error) {
    console.error('Stock movements chart error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}