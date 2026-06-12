'use client'

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Notification } from '@/lib/types'

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setNotifications((data || []) as Notification[])
    } catch (err: any) {
      console.error('Error fetching notifications:', err.message || err)
      setError('We couldn\'t load this section right now.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()

    if (!userId) return

    // Realtime subscription for this user's notifications
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (updateError) throw updateError

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
    } catch (err: any) {
      console.error('Error marking notification as read:', err.message)
    }
  }

  const markAllAsRead = async () => {
    if (!userId) return
    try {
      const unread = notifications.filter(n => !n.is_read)
      if (unread.length === 0) return

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)

      if (updateError) throw updateError

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err.message)
    }
  }

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
