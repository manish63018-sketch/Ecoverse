import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedPaths = ["/dashboard", "/profile", "/settings", "/admin"];
  const adminPaths = ["/admin"];
  const path = request.nextUrl.pathname;

  if (protectedPaths.some((p) => path.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminPaths.some((p) => path.startsWith(p)) && session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle CORS & Preflight (from original proxy)
  if (path.startsWith("/api")) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
      "https://ecoverseindia.web.app",
      "https://ecoverseindia.firebaseapp.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    if (request.method === "OPTIONS") {
      const corsRes = new NextResponse(null, { status: 204 });
      if (allowedOrigins.includes(origin)) {
        corsRes.headers.set("Access-Control-Allow-Origin", origin);
      } else {
        corsRes.headers.set("Access-Control-Allow-Origin", origin || "*");
      }
      corsRes.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      corsRes.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      corsRes.headers.set("Access-Control-Allow-Credentials", "true");
      corsRes.headers.set("Access-Control-Max-Age", "86400");
      return corsRes;
    }

    if (allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
