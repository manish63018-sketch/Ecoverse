'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) loadProfile(data.session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_, session) => {
        setUser(session?.user ?? null)
        if (session?.user) loadProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(id: string) {
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', id).single()
      setProfile(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => user && loadProfile(user.id)

  const compatUser = user ? {
    ...user,
    uid: user.id,
    photoURL: user.user_metadata?.avatar_url || null,
    displayName: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
  } : null;

  return {
    user: compatUser, profile, loading,
    signOut: () => supabase.auth.signOut(),
    refetch,
    refetchProfile: refetch
  }
}
