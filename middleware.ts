import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths including dashboard
const protectedPaths = [
  '/dashboard',
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
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth-token')?.value;

  // Redirect unauthenticated user from protected routes
  if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login/signup
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
