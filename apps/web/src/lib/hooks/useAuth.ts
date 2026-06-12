'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { AuthUser } from '@/context/AuthContext'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const getMappedUser = (sUser: SupabaseUser, prof: Profile | null): AuthUser => {
    return {
      ...sUser,
      uid: sUser.id,
      displayName: prof?.full_name || sUser.user_metadata?.full_name || "EcoVerse User",
      photoURL: prof?.avatar_url || sUser.user_metadata?.avatar_url || null,
    };
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(data)
      return data
    } catch (err) {
      console.error('Profile fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const prof = await fetchProfile(currentUser.id)
        setUser(getMappedUser(currentUser, prof))
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        if (currentUser) {
          const prof = await fetchProfile(currentUser.id)
          setUser(getMappedUser(currentUser, prof))
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { 
    user, 
    profile, 
    loading, 
    signOut, 
    refetchProfile: async () => {
      const session = await supabase.auth.getSession();
      const currentUser = session.data.session?.user;
      if (currentUser) {
        const prof = await fetchProfile(currentUser.id)
        setUser(getMappedUser(currentUser, prof))
      }
    }
  }
}
