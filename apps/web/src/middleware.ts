import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecoverseindia.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.delete({ name, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected paths
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/rescue') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/adopt') ||
    pathname.startsWith('/volunteers') ||
    pathname.startsWith('/ngos')

  // Auth paths
  const isAuthPath = 
    pathname.startsWith('/auth/login') || 
    pathname.startsWith('/auth/signup') || 
    pathname.startsWith('/auth/reset-password') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/reset-password'

  if (isProtectedPath && !user) {
    // Redirect unauthenticated users to `/auth/login`
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (isAuthPath && user) {
    // Redirect authenticated users trying to access auth pages to `/dashboard`
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Admin protection
  if (pathname.startsWith('/admin') && user) {
    // Fetch profile details to verify is_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || !profile.is_admin) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/rescue/:path*',
    '/map/:path*',
    '/adopt/:path*',
    '/volunteers/:path*',
    '/ngos/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/login',
    '/signup',
    '/reset-password'
  ],
}
