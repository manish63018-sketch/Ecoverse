export interface RewardLetter {
  subject: string;
  badge_emoji: string;
  badge_name: string;
  headline: string;
  body: string;
  cta_text: string;
  cta_link: string;
}

export const REWARD_LETTERS: Record<string, RewardLetter> = {
  FIRST_RESCUE: {
    subject: '🐾 You just saved your first life — EcoVerse',
    badge_emoji: '🌟',
    badge_name: 'First Rescue',
    headline: 'You Did It.',
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
    cta_text: 'See Your Rescue',
    cta_link: '/dashboard',
  },

  RESCUE_5: {
    subject: '🏅 5 lives saved — You are a true rescuer',
    badge_emoji: '🏅',
    badge_name: 'Rescue Hero',
    headline: '5 Lives. 5 Stories. All Because of You.',
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
    cta_text: 'View Your Impact',
    cta_link: '/dashboard',
  },

  VEGAN_7_DAYS: {
    subject: '🌱 7 days vegan — You chose compassion',
    badge_emoji: '🌱',
    badge_name: 'New Sprout',
    headline: '7 Days. Thousands of Lives Touched.',
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
    cta_text: 'Continue Challenge',
    cta_link: '/community?tab=vegans',
  },

  JOINED_COMMUNITY: {
    subject: '💌 Welcome to EcoVerse — You belong here',
    badge_emoji: '🌍',
    badge_name: 'EcoVerse Member',
    headline: 'Welcome Home.',
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
    cta_text: 'Start Your Journey →',
    cta_link: '/dashboard',
  },
};

export function buildEmailHTML(letter: RewardLetter, body: string, name: string): string {
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
