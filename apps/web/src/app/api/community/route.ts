import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const supabase = await createSupabaseServer();
    let query = supabase
      .from("community_posts")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    // Filter out expired posts
    const now = new Date();
    const validPosts = (posts || []).filter((post: any) => {
      if (!post.expires_at) return true;
      return new Date(post.expires_at) > now;
    });

    return NextResponse.json({ data: validPosts });
  } catch (error: any) {
    console.error("GET /api/community failed:", error);
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
    const { content, category, image_url, tags } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing required field: content" }, { status: 400 });
    }

    // Get author details to record in post metadata
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, city_name, state_name")
      .eq("id", user.id)
      .maybeSingle();

    const authorName = profile?.full_name || user.user_metadata?.full_name || "EcoVerse User";
    const authorAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || null;

    const newPost = {
      author_id: user.id,
      author_name: authorName,
      author_avatar: authorAvatar,
      content,
      category: category || "general",
      image_url: image_url || null,
      tags: tags || [],
      city_name: profile?.city_name || null,
      state_name: profile?.state_name || null,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      is_pinned: false,
      is_flagged: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ttl_days: 30,
    };

    const { data: createdPost, error: insertError } = await supabase
      .from("community_posts")
      .insert(newPost)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ data: createdPost }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/community failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
