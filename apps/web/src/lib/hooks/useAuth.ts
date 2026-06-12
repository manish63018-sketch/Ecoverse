'use client'

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const context = useAuthContext();

  return {
    user: context.user,
    profile: context.profile,
    loading: context.loading,
    error: null,
    signOut: context.logout,
    signInWithEmail: context.signInWithEmail,
    signUpWithEmail: context.signUpWithEmail,
    refetchProfile: context.refetchProfile
  };
}
