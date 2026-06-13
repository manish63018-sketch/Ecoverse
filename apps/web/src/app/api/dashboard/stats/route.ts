import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    const [volsRes, ngosRes, rescuesRes, resolvedRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .contains('roles', ['volunteer']),
      supabase
        .from('ngos')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('rescue_cases')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('rescue_cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
    ]);

    if (volsRes.error) throw volsRes.error;
    if (ngosRes.error) throw ngosRes.error;
    if (rescuesRes.error) throw rescuesRes.error;
    if (resolvedRes.error) throw resolvedRes.error;

    return NextResponse.json({
      data: {
        volunteers: volsRes.count || 0,
        ngos: ngosRes.count || 0,
        rescues: rescuesRes.count || 0,
        resolvedRescues: resolvedRes.count || 0,
      }
    });
  } catch (error: any) {
    console.error("GET /api/dashboard/stats failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
