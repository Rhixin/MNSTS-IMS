import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No authentication token found'
      }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid authentication token'
      }, { status: 401 })
    }

    if (!user.isVerified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email not verified'
      }, { status: 401 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Authentication failed'
    }, { status: 401 })
  }
}