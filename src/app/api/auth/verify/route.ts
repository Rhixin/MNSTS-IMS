import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Verification token is required'
      }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    })

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid verification token'
      }, { status: 400 })
    }

    if (user.isVerified) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Account is already verified'
      }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Email verified successfully. You can now sign in.'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}