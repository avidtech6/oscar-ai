// Server-side layout load for auth protection
import { createServerClientWithCookies, shouldBypassAuth } from '$lib/auth/client'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ cookies, url }: { cookies: any; url: URL }) => {
  // Public routes that don't require auth
  const publicRoutes = ['/login', '/auth/callback', '/recovery', '/unlock']
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  // Check if auth should be bypassed (development mode)
  if (shouldBypassAuth()) {
    console.log('[DEV] Auth bypass enabled')
    return {
      session: null,
      user: null,
      isAuthenticated: false,
      isPublicRoute
    }
  }

  // During static build (SSR but not dev), we cannot have real sessions.
  // Return dummy data to allow pre-rendering.
  if (import.meta.env.SSR && !import.meta.env.DEV) {
    console.log('[BUILD] Static build detected, returning empty session')
    return {
      session: null,
      user: null,
      isAuthenticated: false,
      isPublicRoute
    }
  }

  // Create Supabase client for server-side
  const supabase = createServerClientWithCookies(cookies)
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If no session and not on public route, redirect to login
  if (!session && !isPublicRoute) {
    console.log('No session, redirecting to login from:', url.pathname)
    throw redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`)
  }

  // If session exists and on login page, redirect to unlock or dashboard
  if (session && url.pathname === '/login') {
    console.log('Session exists, redirecting from login')
    throw redirect(303, '/unlock')
  }

  // Return session data to client
  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isPublicRoute
  }
}