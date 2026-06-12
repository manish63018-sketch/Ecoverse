'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface DashboardStats {
  volunteers: number
  ngos: number
  rescues: number
  resolvedRescues: number
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats>({
    volunteers: 0,
    ngos: 0,
    rescues: 0,
    resolvedRescues: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query table counts in parallel using head: true option which is super fast
      const [volsRes, ngosRes, rescuesRes, resolvedRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .contains('roles', ['volunteer']),
        supabase
          .from('ngos')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('rescue_cases')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('rescue_cases')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'resolved')
      ])

      if (volsRes.error) throw volsRes.error
      if (ngosRes.error) throw ngosRes.error
      if (rescuesRes.error) throw rescuesRes.error
      if (resolvedRes.error) throw resolvedRes.error

      setData({
        volunteers: volsRes.count || 0,
        ngos: ngosRes.count || 0,
        rescues: rescuesRes.count || 0,
        resolvedRescues: resolvedRes.count || 0,
      })
    } catch (err: any) {
      console.error('Error fetching dashboard stats from Supabase:', err.message || err)
      setError('We couldn\'t load this section right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { data, loading, error, refetch: fetchStats }
}
