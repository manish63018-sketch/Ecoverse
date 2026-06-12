import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RewardLetter {
  subject: string;
  badge_emoji: string;
  badge_name: string;
  headline: string;
  body: string;
  cta_text: string;
  cta_link: string;
}

const REWARD_LETTERS: Record<string, RewardLetter> = {
  FIRST_RESCUE: {
    subject: "🐾 You just saved your first life — EcoVerse",
    badge_emoji: "🌟",
    badge_name: "First Rescue",
    headline: "You Did It.",
    body: `Dear {{name}},

Today, you did something most people only talk about.
You actually showed up.

An animal was in need, and you were there.
That animal doesn't know your name, but they felt your care.
They are safe now — because of you.

This is your first rescue. It won't be your last.

Welcome to the small group of people who actually make a difference.

The animals of India are lucky to have you.

With love and gratitude,
The EcoVerse Team 🌍

"थोड़ा सा समय किसी जानवर की जान बचा सकता है।"`,
    cta_text: "See Your Rescue",
    cta_link: "/dashboard",
  },

  RESCUE_5: {
    subject: "🏅 5 lives saved — You are a true rescuer",
    badge_emoji: "🏅",
    badge_name: "Rescue Hero",
    headline: "5 Lives. 5 Stories. All Because of You.",
    body: `Dear {{name}},

Five animals are alive today because you chose to act.

Five scared, hurt, or abandoned creatures experienced
a human's kindness — yours.

Do you realize how rare that is?
Most people scroll past. You showed up. Five times.

We see you. The community sees you.
The animals, in their own way, see you too.

Keep going. You're just getting started.

With deep gratitude,
The EcoVerse Team 🌍`,
    cta_text: "View Your Impact",
    cta_link: "/dashboard",
  },

  VEGAN_7_DAYS: {
    subject: "🌱 7 days vegan — You chose compassion",
    badge_emoji: "🌱",
    badge_name: "New Sprout",
    headline: "7 Days. Thousands of Lives Touched.",
    body: `Dear {{name}},

Seven days ago, you made a choice.

Not just a food choice — a values choice.
You said: "I will not contribute to suffering if I can help it."

In these 7 days, you have:
  • Saved approximately 14 animals from slaughter
  • Reduced your carbon footprint by 7kg
  • Inspired everyone who saw you make this choice

This is just day 7. Imagine day 30. Imagine day 365.

You are becoming someone who changes the world
— one meal at a time.

We are proud of you.

With green love,
The EcoVerse Team 🌍

🌱 → 🌿 → 🌳 Your journey is just beginning.`,
    cta_text: "Continue Challenge",
    cta_link: "/community?tab=vegans",
  },

  JOINED_COMMUNITY: {
    subject: "💌 Welcome to EcoVerse — You belong here",
    badge_emoji: "🌍",
    badge_name: "EcoVerse Member",
    headline: "Welcome Home.",
    body: `Dear {{name}},

You just joined something real.

EcoVerse isn't an app. It's a promise — that no animal
in India should suffer alone because no human cared enough.

You are now part of a community of rescuers, feeders,
vets, vegans, adopters, and everyday heroes
who show up when it matters most.

Here's what you can do right now:
  🐾 Set your roles — tell us how you want to help
  📍 Enable location — receive SOS alerts near you
  🗺 Explore the map — see your city's animal welfare network
  💬 Introduce yourself — the community is waiting to meet you

One last thing:

You didn't have to join. You chose to.
That choice matters more than you know.

The animals are waiting for heroes like you.

With so much hope,
The EcoVerse Team 🌍

"इंसान हैं हम — दया हमारी पहचान है।"`,
    cta_text: "Start Your Journey →",
    cta_link: "/dashboard",
  },
};

function buildEmailHTML(letter: RewardLetter, body: string, name: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #050f07; color: #e8f5e9;
           font-family: Georgia, serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .badge { text-align: center; font-size: 64px;
             margin-bottom: 16px; }
    .headline { text-align: center; font-size: 28px;
                color: #66BB6A; font-weight: bold;
                margin-bottom: 32px; }
    .letter { background: rgba(46,125,50,0.12);
              border: 1px solid rgba(102,187,106,0.2);
              border-radius: 16px; padding: 32px;
              white-space: pre-line; line-height: 1.8;
              font-size: 15px; color: rgba(255,255,255,0.85); }
    .cta { display: block; text-align: center;
           background: #2E7D32; color: white;
           text-decoration: none; padding: 14px 32px;
           border-radius: 12px; font-weight: bold;
           font-size: 16px; margin: 32px auto; width: fit-content; }
    .footer { text-align: center; color: rgba(255,255,255,0.3);
              font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:20px;color:#66BB6A;font-weight:bold">
        ∞ EcoVerse
      </span>
    </div>
    <div class="badge">${letter.badge_emoji}</div>
    <div class="headline">${letter.headline}</div>
    <div class="letter">${body}</div>
    <a class="cta" href="https://ecoverseindia.web.app${letter.cta_link}">
      ${letter.cta_text}
    </a>
    <div class="footer">
      EcoVerse India • One Earth. One Community. Infinite Compassion.<br/>
      You are receiving this because you are a member of EcoVerse.<br/>
      <a href="#" style="color:#66BB6A">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { userId, milestoneType } = await req.json();
    if (!userId || !milestoneType) {
      return new Response(JSON.stringify({ error: "Missing userId or milestoneType" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get user profile name
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileErr) {
      console.warn("Could not find profile name:", profileErr);
    }

    // Get user email from auth admin API
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(userId);
    if (userErr || !userData?.user?.email) {
      return new Response(
        JSON.stringify({ error: "Could not find user email details", details: userErr }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const email = userData.user.email;
    const name = profile?.full_name?.split(" ")[0] || "Friend";

    const letter = REWARD_LETTERS[milestoneType];
    if (!letter) {
      return new Response(JSON.stringify({ error: `Invalid milestoneType: ${milestoneType}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = letter.body.replace("{{name}}", name);

    // Send via Resend API if configured
    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EcoVerse <hello@ecoverseindia.org>",
            to: email,
            subject: letter.subject,
            html: buildEmailHTML(letter, body, name),
          }),
        });

        if (!emailResponse.ok) {
          const errText = await emailResponse.text();
          console.error("Resend API returned error status:", emailResponse.status, errText);
        } else {
          console.log(`Milestone email successfully queued to ${email}`);
        }
      } catch (emailErr) {
        console.error("Error communicating with Resend:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY environment variable is not set. Skipping email dispatch.");
    }

    // Insert earned badge record
    const { error: badgeErr } = await supabase.from("user_badges").insert([
      {
        user_id: userId,
        badge_type: milestoneType.toLowerCase(),
        badge_name: letter.badge_name,
        badge_emoji: letter.badge_emoji,
        earned_at: new Date().toISOString(),
      },
    ]);
    if (badgeErr) {
      console.error("Failed to save user badge:", badgeErr);
    }

    // Create in-app notification
    const { error: notifErr } = await supabase.from("notifications").insert([
      {
        user_id: userId,
        type: "badge_earned",
        title: `${letter.badge_emoji} ${letter.badge_name} badge earned!`,
        body: letter.headline,
        link_to: letter.cta_link,
        created_at: new Date().toISOString(),
      },
    ]);
    if (notifErr) {
      console.error("Failed to create in-app notification:", notifErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("send-reward-letter execution error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
