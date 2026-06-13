'use client';

/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { signUp, signIn } from "@/lib/auth";

export type AuthUser = any;

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
    username: string,
    roles: string[],
    primaryRole: string,
    city: string,
    state: string,
    area?: string,
    phone?: string,
    availableNow?: boolean
  ) => Promise<any>;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      // Safe fallback profile creation if row is missing
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'EcoVerse User',
          username: user.user_metadata?.username || 'user_' + user.id.substring(0, 8),
          email: user.email || '',
          state_name: user.user_metadata?.state_name || 'Delhi',
          city_name: user.user_metadata?.city_name || 'New Delhi',
          area_name: user.user_metadata?.area_name || null,
          roles: user.user_metadata?.roles || ['volunteer'],
          primary_role: user.user_metadata?.primary_role || 'volunteer',
          available_now: !!user.user_metadata?.available_now,
          verification_status: 'unverified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert(fallbackProfile)
          .select()
          .single();

        if (insertError) {
          console.error("Failed to insert fallback profile:", insertError);
        } else if (newProfile) {
          setProfile(newProfile as Profile);
          return newProfile as Profile;
        }
      }

      setProfile(null);
      return null;
    } catch (err) {
      console.error("Profile fetch error in AuthProvider:", err);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    }
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/login`,
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await signIn(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    roles: string[],
    primaryRole: string,
    city: string,
    state: string,
    area: string = "",
    phone: string = "",
    availableNow: boolean = false
  ) => {
    try {
      setLoading(true);
      const user = await signUp(email, password, fullName, username, roles, primaryRole, city, state, area, phone, availableNow);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
