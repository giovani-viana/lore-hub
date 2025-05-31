import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Aqui você pode adicionar sua lógica de middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Adicione aqui os caminhos que devem passar pelo middleware
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 