import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Next.js Router Context might throw if called from Server Component during render
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete(name)
          } catch {
            // Next.js Router Context might throw
          }
        },
      },
    }
  )
}
