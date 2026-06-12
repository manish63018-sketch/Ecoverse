'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'

export function useAdminUsers() {
  const [data, setData] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setData((profiles || []) as Profile[])
    } catch (err: any) {
      console.error('Error fetching admin users:', err.message || err)
      setError('We couldn\'t load this section right now.')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { data, loading, error, refetch: fetchUsers }
}
