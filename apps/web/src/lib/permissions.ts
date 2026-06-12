/**
 * "Supabase is the only source of truth for authentication and app data."
 */

import { Profile, RescueCase } from "./types";

/**
 * Checks if a user profile has administrator access.
 */
export function canViewAdmin(profile: Profile | null): boolean {
  if (!profile) return false;
  return profile.is_admin === true || profile.primary_role === "admin" || profile.roles.includes("admin");
}

/**
 * Checks if a user profile has moderator or administrator permissions.
 */
export function canModeratePosts(profile: Profile | null): boolean {
  if (!profile) return false;
  return (
    profile.is_admin === true ||
    profile.is_moderator === true ||
    profile.primary_role === "admin" ||
    profile.primary_role === "moderator" ||
    profile.roles.includes("admin") ||
    profile.roles.includes("moderator")
  );
}

/**
 * Checks if a user can edit a specific profile.
 */
export function canEditOwnProfile(userId: string | undefined, profileId: string | null): boolean {
  if (!userId || !profileId) return false;
  return userId === profileId;
}

/**
 * Checks if a user is authorized to manage or update a specific rescue case.
 */
export function canManageRescueCase(profile: Profile | null, rescueCase: RescueCase | null): boolean {
  if (!profile || !rescueCase) return false;
  if (canViewAdmin(profile)) return true;
  return (
    profile.id === rescueCase.reporter_id ||
    profile.id === rescueCase.assigned_volunteer_id ||
    profile.id === rescueCase.assigned_ngo_id
  );
}

/**
 * Checks if a user is permitted to view exact GPS coordinates of a rescue case.
 */
export function canViewSensitiveLocation(profile: Profile | null, rescueCase: RescueCase | null): boolean {
  if (!profile || !rescueCase) return false;
  if (canViewAdmin(profile)) return true;
  if (profile.roles.includes("rescuer") || profile.primary_role === "rescuer") return true;
  return (
    profile.id === rescueCase.reporter_id ||
    profile.id === rescueCase.assigned_volunteer_id
  );
}
