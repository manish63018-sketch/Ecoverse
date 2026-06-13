import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const stateName = searchParams.get("state_name") || searchParams.get("stateName");
    const cityName = searchParams.get("city_name") || searchParams.get("cityName");
    const areaName = searchParams.get("area_name") || searchParams.get("areaName");
    const animalType = searchParams.get("animal_type") || searchParams.get("animalType");
    const emergencyLevel = searchParams.get("emergency_level") || searchParams.get("emergencyLevel");

    const supabase = await createSupabaseServer();
    let query = supabase.from("rescue_cases").select("*").order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    } else {
      query = query.in("status", ["open", "assigned", "in_progress", "escalated"]);
    }

    if (stateName) query = query.eq("state_name", stateName);
    if (cityName) query = query.eq("city_name", cityName);
    if (areaName) query = query.eq("area_name", areaName);
    if (animalType && animalType !== "all") query = query.eq("animal_type", animalType);
    if (emergencyLevel && emergencyLevel !== "all") query = query.eq("emergency_level", emergencyLevel);

    const { data: cases, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: cases || [] });
  } catch (error: any) {
    console.error("GET /api/rescue failed:", error);
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
    const {
      title,
      description,
      animal_type,
      emergency_level,
      state_name,
      city_name,
      area_name,
      landmark,
      lat,
      lng,
      image_urls
    } = body;

    if (!animal_type || !state_name || !city_name || !area_name) {
      return NextResponse.json(
        { error: "Missing required fields: animal_type, state_name, city_name, area_name" },
        { status: 400 }
      );
    }

    // Get reporter profile to record reporter_name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const reporterName = profile?.full_name || user.user_metadata?.full_name || "EcoVerse User";

    const newCase = {
      title: title || `${animal_type.toUpperCase()} rescue at ${area_name}`,
      description: description || "",
      animal_type,
      severity: emergency_level || "medium",
      emergency_level: emergency_level || "medium",
      status: "open",
      state_name,
      city_name,
      area_name,
      landmark: landmark || "",
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      reporter_id: user.id,
      reporter_name: reporterName,
      image_urls: image_urls || [],
      photo_urls: image_urls || [],
      reported_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data: createdCase, error: insertError } = await supabase
      .from("rescue_cases")
      .insert(newCase)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ data: createdCase }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/rescue failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
