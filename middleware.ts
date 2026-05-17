import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some(path => pathname.startsWith(path))
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    if (isPublic) { return NextResponse.next() }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = await verifyJWT(token)

    // Already logged in, redirect away from login page
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Inject user info into request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.userId)
    requestHeaders.set('x-username', user.username)
    requestHeaders.set('x-user-role', user.role)

    return NextResponse.next({ request: { headers: requestHeaders } })
  }
  catch {
    if (isPublic) { return NextResponse.next() }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|vs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)'],
}
