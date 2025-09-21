import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token and password are required'
      }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid or expired reset token'
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}