/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { supabase } from "./supabase";

export class AuthError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * Normalizes Supabase auth errors into friendly user-facing messages.
 */
function handleAuthError(error: any): AuthError {
  const message = error.message || "";
  const code = error.status || error.code || "";

  if (message.includes("Invalid login credentials") || message.includes("invalid-credential") || message.includes("wrong-password") || message.includes("invalid_grant")) {
    return new AuthError("Email or password incorrect", "invalid-credential");
  }
  if (message.includes("User already exists") || message.includes("email-already-in-use")) {
    return new AuthError("Email address is already in use.", "email-already-in-use");
  }
  if (message.includes("Password should be") || message.includes("weak-password")) {
    return new AuthError("Password must be at least 6 characters long.", "weak-password");
  }
  if (message.includes("Email address is invalid") || message.includes("invalid-email")) {
    return new AuthError("Please enter a valid email address.", "invalid-email");
  }
  if (message.includes("Email not confirmed") || message.includes("verify your email") || message.includes("Email not verified")) {
    return new AuthError("Please verify your email", "email-not-verified");
  }
  if (message.includes("User not found") || message.includes("user-not-found")) {
    return new AuthError("No account found", "user-not-found");
  }
  if (message.includes("suspended") || message.includes("disabled") || message.includes("Account is inactive") || message.includes("inactive")) {
    return new AuthError("Account is inactive", "account-disabled");
  }
  
  return new AuthError("Something went wrong. Please try again.", code || "unknown");
}

/**
 * Log in a user with email and password via Supabase.
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error("Supabase sign in error:", error.message);
    throw handleAuthError(error);
  }
}

/**
 * Registers a new user and lets the database trigger handle profile insertion.
 */
export async function signUp(
  email: string, 
  password: string, 
  fullName: string, 
  username: string,
  role: string,
  city: string,
  state: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase().trim(),
          role: role,
          city_name: city,
          state_name: state,
        },
        emailRedirectTo: `${window.location.origin}/auth/login`,
      }
    });

    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error("Supabase sign up error:", error.message);
    throw handleAuthError(error);
  }
}

/**
 * Requests a password reset link for the given email address.
 */
export async function resetPasswordForEmail(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  } catch (error: any) {
    console.error("Supabase reset password request error:", error.message);
    throw handleAuthError(error);
  }
}

/**
 * Updates the user's password.
 */
export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw error;
  } catch (error: any) {
    console.error("Supabase update password error:", error.message);
    throw handleAuthError(error);
  }
}
