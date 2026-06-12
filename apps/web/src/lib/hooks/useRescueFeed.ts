'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RescueCase } from '@/lib/types'

export function useRescueFeed(filter?: {
  status?: string
  city?: string
  animalType?: string
  emergencyLevel?: string
}) {
  const [cases, setCases] = useState<RescueCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('rescue_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status)
      }
      if (filter?.city) {
        query = query.ilike('city_name', `%${filter.city}%`)
      }
      if (filter?.animalType && filter.animalType !== 'all') {
        query = query.eq('animal_type', filter.animalType)
      }
      if (filter?.emergencyLevel && filter.emergencyLevel !== 'all') {
        query = query.eq('emergency_level', filter.emergencyLevel)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        // Table might not exist yet — return empty array gracefully
        if (fetchError.code === 'PGRST116' || fetchError.code === '42P01') {
          setCases([])
          return
        }
        throw fetchError
      }
      setCases(data || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Rescue feed error:', msg)
      setError('Could not load rescue cases. Please try again.')
      setCases([]) // Always set empty array, never leave undefined
    } finally {
      setLoading(false)
    }
  }, [filter?.status, filter?.city, filter?.animalType, filter?.emergencyLevel])

  useEffect(() => {
    fetchCases()

    // Realtime subscription
    const channel = supabase
      .channel('rescue_cases_feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rescue_cases',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCases(prev => [payload.new as RescueCase, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCases(prev => prev.map(c =>
            c.id === payload.new.id ? (payload.new as RescueCase) : c
          ))
        } else if (payload.eventType === 'DELETE') {
          setCases(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCases])

  return { cases, loading, error, refetch: fetchCases }
}
