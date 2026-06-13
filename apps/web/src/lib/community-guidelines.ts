export const COMMUNITY_PILLARS = [
  {
    icon: '🐾',
    title: 'Every life matters',
    description: 'We are here for the animals. Every disagreement — ask yourself: does this argument save a life? If not, let it go.'
  },
  {
    icon: '💚',
    title: 'Compassion first — always',
    description: 'The same compassion we show animals, we show each other. No exceptions.'
  },
  {
    icon: '🤝',
    title: 'We are teammates, not opponents',
    description: 'Different approaches, same goal. A rescuer and a feeder may disagree on method — but both love the same dog.'
  },
  {
    icon: '🌱',
    title: 'Grow together',
    description: 'Nobody starts knowing everything. Help, teach, learn. Never shame.'
  },
];

export const COMMUNITY_RULES = [
  {
    rule: 'No personal attacks',
    detail: 'Disagree with ideas, never attack people. "That approach may not work because..." is good. "You are wrong/stupid/cruel" is not allowed.',
    consequence: 'Warning → 3-day post ban → Permanent ban'
  },
  {
    rule: 'No misinformation about animal care',
    detail: 'If unsure, ask. Wrong medical advice can kill an animal. Tag posts as advice, not fact, unless you are a verified medical volunteer.',
    consequence: 'Post removed + warning'
  },
  {
    rule: 'No shaming or bullying of new members',
    detail: 'Every expert was once a beginner. Welcome new members. Guide, don\'t judge.',
    consequence: 'Warning + mandatory kindness post'
  },
  {
    rule: 'No unsolicited sales or spam',
    detail: 'This is a welfare community, not a marketplace. Adoption listings belong in /adopt only.',
    consequence: 'Post removed'
  },
  {
    rule: 'Conflict resolution',
    detail: 'If you have a serious issue with a member, use [Report] and our moderators will handle it privately. Public callouts are not allowed.',
    consequence: 'Both parties warned if public fight starts'
  },
];

export const MOTIVATIONAL_LINES = [
  'थोड़ा सा समय किसी जानवर की जान बचा सकता है। 🐾',
  'You don\'t have to be a vet to save a life. Just show up.',
  'One person who cares is enough to change everything.',
  'The animal cannot speak. You are their voice.',
  'We are humans — kindness is our identity.',
  'Every rescue is a story of hope. Be part of that story.',
  'A small act of kindness today can give an animal years of life.',
  'You found EcoVerse for a reason. That reason has paws.',
  'जानवर बोल नहीं सकते — पर आपका दिल सुन सकता है।',
  'Be the person that animal has been waiting for.',
];

// Real-time conflict detection and rephrasing dictionary
const HARSH_WORDS = [
  'stupid', 'idiot', 'fool', 'shut up', 'useless',
  'wrong person', 'bakwaas', 'bekar', 'chutiya',
  'ganda', 'fraud', 'fake'
];

export function detectConflictWords(text: string): string[] {
  const lowercaseText = text.toLowerCase();
  return HARSH_WORDS.filter(word => lowercaseText.includes(word));
}

export function rephraseHarshText(text: string): string {
  let rephrased = text;

  // Dictionary mapping for rule-based replacements
  const replacements: Record<string, string> = {
    'you are wrong': 'I see it differently',
    'you are stupid': 'I disagree with this approach',
    'stop doing this': 'maybe try this approach instead',
    'idiot': 'friend',
    'fool': 'friend',
    'shut up': 'please let me explain',
    'useless': 'not fully effective',
    'bakwaas': 'unhelpful',
    'bekar': 'unsuitable',
    'chutiya': 'misguided',
    'ganda': 'incorrect',
    'fraud': 'unverified',
    'fake': 'unverified'
  };

  Object.entries(replacements).forEach(([harsh, kind]) => {
    const regex = new RegExp(harsh, 'gi');
    rephrased = rephrased.replace(regex, kind);
  });

  return rephrased;
}
