import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

const publicPaths = ['/login', '/register', '/verify', '/forgot-password', '/reset-password', '/admin/verify-user', '/admin/verification-result']
const authPaths = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Handle root path - simple redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/overview' : '/login', request.url))
  }

  // Handle legacy dashboard redirect
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/overview', request.url))
  }

  // Define public paths that don't need authentication
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  
  // Allow all public paths without any checks
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, just check if token exists (don't validate it here to avoid async issues)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If token exists, allow access (validation will happen in the actual page/API)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}