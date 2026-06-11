const VERCEL_API_URL = "https://web-manish63018-3859s-projects.vercel.app";

export function getApiUrl(path: string): string {
  // Server-side / Build-time should use relative path
  if (typeof window === "undefined") {
    return path;
  }
  
  // Local development should use relative path
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return path;
  }

  // If already on Vercel domain, use relative path
  if (window.location.hostname.endsWith(".vercel.app")) {
    return path;
  }

  // On Firebase Hosting, point to the Vercel deployed backend
  return `${VERCEL_API_URL}${path}`;
}
