import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const action = searchParams.get('action') // 'approve' or 'reject'

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.redirect(new URL('/login?error=invalid_action', request.url))
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=user_not_found_or_already_verified', request.url))
    }

    if (action === 'approve') {
      // Approve the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null
        }
      })

      return NextResponse.redirect(
        new URL(`/admin/verification-result?action=approved&user=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`, request.url)
      )
    } else {
      // Reject the user - delete the account
      await prisma.user.delete({
        where: { id: user.id }
      })

      return NextResponse.redirect(
        new URL(`/admin/verification-result?action=rejected&user=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`, request.url)
      )
    }

  } catch (error) {
    console.error('User verification error:', error)
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json()

    if (!token || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid token or action'
      }, { status: 400 })
    }

    // Note: This endpoint does NOT require authentication
    // The verification token itself serves as authorization

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        isVerified: false
      }
    })

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found or already verified'
      }, { status: 404 })
    }

    if (action === 'approve') {
      // Approve the user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null
        }
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        message: `User ${user.firstName} ${user.lastName} has been approved successfully`,
        data: { action: 'approved', user: user.firstName + ' ' + user.lastName }
      })
    } else {
      // Reject the user - delete the account
      await prisma.user.delete({
        where: { id: user.id }
      })

      return NextResponse.json<ApiResponse>({
        success: true,
        message: `Registration for ${user.firstName} ${user.lastName} has been rejected and deleted`,
        data: { action: 'rejected', user: user.firstName + ' ' + user.lastName }
      })
    }

  } catch (error) {
    console.error('User verification error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}