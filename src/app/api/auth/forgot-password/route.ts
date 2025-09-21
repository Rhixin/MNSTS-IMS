import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a password reset link.'
      })
    }

    const resetToken = generateVerificationToken()
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      }
    })

    const emailHtml = getPasswordResetEmailTemplate(user.firstName, resetToken)
    await sendEmail({
      to: email,
      subject: 'Reset Your MNSTS IMS Password',
      html: emailHtml
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}