import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken } from '@/lib/auth'
import { sendEmail, getAdminVerificationEmailTemplate } from '@/lib/email'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'All fields are required'
      }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User already exists with this email'
      }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const verificationToken = generateVerificationToken()

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
        isVerified: false,
      }
    })

    // Send verification email to admin
    const adminEmail = process.env.GMAIL_USER
    if (!adminEmail) {
      console.error('Admin email not configured in environment variables')
    } else {
      const emailHtml = getAdminVerificationEmailTemplate({
        firstName,
        lastName,
        email,
        verificationToken
      })

      await sendEmail({
        to: adminEmail,
        subject: `🔔 New User Registration Request - ${firstName} ${lastName}`,
        html: emailHtml
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Account created successfully. Your registration is pending admin approval.',
      data: {
        userId: user.id,
        email: user.email,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}