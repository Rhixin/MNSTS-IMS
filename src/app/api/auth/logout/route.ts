import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    message: 'Logout successful'
  })

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  })

  return response
}