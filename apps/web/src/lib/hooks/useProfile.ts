'use client'

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

export function useProfile(userId?: string) {
  const [data, setData] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (profile) {
        setData(profile as Profile)
      } else {
        throw new Error('Profile not found')
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message || err)
      setError('We couldn\'t load this profile right now.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { data, loading, error, refetch: fetchProfile }
}
