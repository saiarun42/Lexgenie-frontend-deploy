import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be protected (require authentication)
const protectedPaths = [
  '/contract-generator',
  '/ai-contract-generator',
  '/summarise-contract',
  '/lex-citation',
  '/legal-lens',
  '/legal-assistant',
  '/headnote-generation',
  '/compare-contract',
  '/bns-search',
  '/summarizer',
  '/profile',
  '/dashboard'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value

  // If it's a protected path and there's no token, redirect to login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and tries to access login/signup pages, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 