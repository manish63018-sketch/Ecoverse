import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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
    }

    const { error: updateError } = await query;
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/notifications/read failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
