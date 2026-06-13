import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ data: notifications || [] });
  } catch (error: any) {
    console.error("GET /api/notifications failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body;

    let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);

    if (action === "mark_all_read" || action === "read_all") {
      // update all
    } else if (notificationId) {
      query = query.eq("id", notificationId);
    } else {
      return NextResponse.json({ error: "Missing notificationId or action = mark_all_read" }, { status: 400 });
    }

    const { error: updateError } = await query;
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/notifications failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
