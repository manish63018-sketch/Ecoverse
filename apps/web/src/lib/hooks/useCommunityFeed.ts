'use client'

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CommunityPost } from '@/lib/types'

export function useCommunityFeed(category?: string) {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setError(null)
      
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Filter out expired posts client-side for safety (DB trigger also cleans them up)
      const now = new Date()
      const validPosts = (data || []).filter((post: any) => {
        if (!post.expires_at) return true
        return new Date(post.expires_at) > now
      }) as CommunityPost[]

      setPosts(validPosts)
    } catch (err: any) {
      console.error('Error fetching community posts:', err.message || err)
      setError('We couldn\'t load this section right now.')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchPosts()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('realtime-community-posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPosts])

  return { posts, loading, error, refetch: fetchPosts, setPosts }
}
