'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RescueCase } from '@/types/rescue'
import { cities, areas } from '@/lib/locations-data'

export function useRescueFeed(filter?: {
  status?: string
  city?: string
  cityName?: string
  areaId?: string
  areaName?: string
  stateName?: string
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

      // 1. Status filter
      if (filter?.status && filter.status !== 'all') {
        query = query.eq('status', filter.status)
      } else {
        // default active feed statuses
        query = query.in('status', ['open', 'assigned', 'in_progress', 'escalated'])
      }

      // 2. Resolve area ID/name filter
      let resolvedAreaName = filter?.areaName
      if (filter?.areaId && filter.areaId !== 'all') {
        const areaObj = areas.find(a => a.id === filter.areaId)
        resolvedAreaName = areaObj ? areaObj.name : filter.areaId
      }

      // 3. Resolve city ID/name filter
      let resolvedCityName = filter?.cityName
      if (filter?.city && filter.city !== 'all') {
        const cityObj = cities.find(c => c.id === filter.city || c.slug === filter.city)
        resolvedCityName = cityObj ? cityObj.name : filter.city
      }

      // Apply location constraints in order of specificity
      if (resolvedAreaName) {
        query = query.eq('area_name', resolvedAreaName)
      } else if (resolvedCityName) {
        query = query.eq('city_name', resolvedCityName)
      } else if (filter?.stateName) {
        query = query.eq('state_name', filter.stateName)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      let list = (data || []).map((c: any) => ({
        id: c.id,
        reporter_user_id: c.reporter_id || undefined,
        reporter_name: c.reporter_name,
        state_id: c.state_name,
        city_id: c.city_name,
        area_id: c.area_name,
        area_name: c.area_name,
        display_zone: c.display_zone || `${c.area_name}, ${c.city_name}`,
        animal_type: c.animal_type,
        condition_summary: c.condition_summary,
        emergency_level: c.emergency_level,
        description: c.description,
        status: c.status,
        assigned_volunteer_id: c.assigned_volunteer_id || undefined,
        assigned_ngo_id: c.assigned_ngo_id || undefined,
        created_at: c.created_at,
        assigned_at: c.assigned_at || undefined,
        resolved_at: c.resolved_at || undefined,
      })) as RescueCase[]

      // 4. Animal type & Severity filters (can also be done server-side, but client-side matching is robust)
      if (filter?.animalType && filter.animalType !== 'all') {
        list = list.filter(c => c.animal_type === filter.animalType)
      }
      if (filter?.emergencyLevel && filter.emergencyLevel !== 'all') {
        list = list.filter(c => c.emergency_level === filter.emergencyLevel)
      }

      setCases(list)
    } catch (err: any) {
      console.error('Error fetching rescue feed from Supabase:', err.message || err)
      setError('Could not load rescue cases. Please try again.')
      setCases([])
    } finally {
      setLoading(false)
    }
  }, [
    filter?.status,
    filter?.city,
    filter?.cityName,
    filter?.areaId,
    filter?.areaName,
    filter?.stateName,
    filter?.animalType,
    filter?.emergencyLevel
  ])

  useEffect(() => {
    fetchCases()

    // Poll every 30 seconds
    const interval = setInterval(fetchCases, 30000)
    return () => clearInterval(interval)
  }, [fetchCases])

  return { cases, loading, error, refetch: fetchCases }
}
