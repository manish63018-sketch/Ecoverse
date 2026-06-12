/**
 * "Supabase is the only source of truth for authentication and app data."
 */
export const PLATFORM_RULES = {
  auth: 'supabase',
  database: 'supabase',
  realtime: 'supabase',
  fileStorage: 'supabase',
  pushNotifications: 'firebase',
  hosting: 'vercel',
};
