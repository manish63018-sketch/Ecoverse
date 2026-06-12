"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";

export type AuthUser = SupabaseUser & {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
};

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) {
        console.warn("Profile fetch error in AuthProvider:", error.message);
        setProfile(null);
        return null;
      } else {
        setProfile(data);
        return data;
      }
    } catch (err) {
      console.error("Profile fetch error in AuthProvider:", err);
      setProfile(null);
      return null;
    }
  };

  const getMappedUser = (sUser: SupabaseUser, prof: Profile | null): AuthUser => {
    return {
      ...sUser,
      uid: sUser.id,
      displayName: prof?.full_name || sUser.user_metadata?.full_name || "EcoVerse User",
      photoURL: prof?.avatar_url || sUser.user_metadata?.avatar_url || null,
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const prof = await fetchProfile(currentUser.id);
        setUser(getMappedUser(currentUser, prof));
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        if (currentUser) {
          const prof = await fetchProfile(currentUser.id);
          setUser(getMappedUser(currentUser, prof));
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Email/Password:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName || "EcoVerse User",
            username: displayName
              ? displayName.toLowerCase().replace(/\s+/g, "_").slice(0, 40) + "_" + Math.floor(Math.random() * 1000)
              : "user_" + Math.floor(Math.random() * 1000000),
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error signing up with Email/Password:", error);
      throw error;
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
    const session = await supabase.auth.getSession();
    const currentUser = session.data.session?.user;
    if (currentUser) {
      const prof = await fetchProfile(currentUser.id);
      setUser(getMappedUser(currentUser, prof));
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
