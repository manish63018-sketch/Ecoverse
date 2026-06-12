export interface ArticleData {
  slug: string;
  category: "Rescue Guide" | "Laws & Rights" | "Vegan Living" | "Animal Health" | "Adoption Tips" | "News";
  title: string;
  excerpt: string;
  author: string;
  authorInitial: string;
  date: string;
  readTime: string;
  content: string; // HTML or Markdown formatted content
}

export const STARTER_ARTICLES: ArticleData[] = [
  {
    slug: "how-to-safely-approach-an-injured-street-dog",
    category: "Rescue Guide",
    title: "How to Safely Approach an Injured Street Dog",
    excerpt: "Learn how to assess injuries, safely approach pain-aggressive dogs, and secure them without getting bitten.",
    author: "Dr. Sandeep Rao",
    authorInitial: "SR",
    date: "June 10, 2026",
    readTime: "5 min read",
    content: `
      <h2>Safety First: Assessing the Scene</h2>
      <p>Before you approach any injured animal, you must ensure your own safety. A dog in intense pain may bite even the most well-meaning rescuer out of self-defense.</p>
      
      <h3>1. Assess from a Distance</h3>
      <p>Observe the dog's body language. Look for signs of aggression or fear: growling, bared teeth, raised hackles, or a tucked tail. Check if they are conscious and notice if they are bleeding heavily.</p>

      <h3>2. Speak in Calm, Low Tones</h3>
      <p>Avoid high-pitched baby talk or loud, sudden shouts. Walk slowly. Do not make direct, intense eye contact, as dogs perceive this as a challenge or threat.</p>

      <h3>3. Improvise a Muzzle if Necessary</h3>
      <p>If the dog is conscious and pain-aggressive, you may need to use a soft bandage or clean cotton leash as a temporary muzzle before lifting them. Never muzzle a vomiting dog.</p>
    `
  },
  {
    slug: "what-to-do-when-you-find-an-abandoned-litter",
    category: "Rescue Guide",
    title: "What to Do When You Find an Abandoned Litter",
    excerpt: "Steps to keep orphaned puppies or kittens warm, assess their health, and arrange fosters.",
    author: "Ritu Sharma",
    authorInitial: "RS",
    date: "June 08, 2026",
    readTime: "4 min read",
    content: `
      <h2>Immediate Steps for Abandoned Newborns</h2>
      <p>Finding a box of abandoned puppies or kittens is a common occurrence. Here is how to keep them alive in the first critical hours.</p>
      
      <h3>1. Wait and Observe</h3>
      <p>Sometimes the mother is simply foraging for food nearby. Wait at a safe distance for 1-2 hours before picking up the litter. If she does not return, proceed with rescue.</p>

      <h3>2. Prevent Hypothermia</h3>
      <p>Newborns cannot regulate their body temperature. Wrap them in a warm, dry towel and place them in a box with a hot water bottle wrapped in cloth.</p>

      <h3>3. Do Not Feed Cow's Milk</h3>
      <p>Cow's milk will cause fatal diarrhea. Use a specialized commercial puppy/kitten milk replacer (CMR/KMR) and feed them using a syringe or tiny bottle.</p>
    `
  },
  {
    slug: "prevention-of-cruelty-to-animals-act-1960",
    category: "Laws & Rights",
    title: "Prevention of Cruelty to Animals Act, 1960 — What Every Indian Must Know",
    excerpt: "Know Sections 11 and 12 of the PCA Act, offenses, penalties, and how to file a police FIR.",
    author: "Adv. Gauri Dev",
    authorInitial: "GD",
    date: "June 05, 2026",
    readTime: "7 min read",
    content: `
      <h2>The Legal Framework of Animal Protection in India</h2>
      <p>The Prevention of Cruelty to Animals (PCA) Act, 1960 is the primary legislation safeguarding animals from abuse in India.</p>

      <h3>Section 11: Acts of Cruelty</h3>
      <p>Under Section 11, torturing, beating, overloading, starving, or abandoning any domestic or wild animal is a punishable offense. Neglecting to provide shelter or clean water is also illegal.</p>

      <h3>How to File an FIR</h3>
      <p>If you witness animal cruelty, gather photo/video evidence. Draft a formal complaint citing Section 11 of the PCA Act and IPC Section 428/429. Submit it to the Station House Officer (SHO) of the nearest police station.</p>
    `
  },
  {
    slug: "feeding-street-animals-legal-right-supreme-court",
    category: "Laws & Rights",
    title: "Feeding Street Animals is Your Legal Right — Supreme Court 2023 Ruling",
    excerpt: "A summary of legal protections for street feeders and AWBI guidelines.",
    author: "Pranav Patil",
    authorInitial: "PP",
    date: "June 02, 2026",
    readTime: "5 min read",
    content: `
      <h2>Feeders' Protection under Indian Law</h2>
      <p>Feeding street dogs and cats is a constitutional duty of kindness under Article 51A(g). In 2023, the Supreme Court of India upheld that resident welfare associations (RWAs) cannot restrict or penalize citizens who feed stray animals.</p>

      <h3>Key AWBI Guidelines</h3>
      <ul>
        <li>Feeding must happen in designated quiet spots away from residential entrances.</li>
        <li>Feeders should cooperate with local municipal corporations for sterilization (ABC) drives.</li>
        <li>Harassing animal feeders constitutes criminal intimidation under Section 506 of the IPC.</li>
      </ul>
    `
  },
  {
    slug: "7-day-vegan-challenge-india-guide",
    category: "Vegan Living",
    title: "7-Day Vegan Challenge: Your Complete India Guide",
    excerpt: "Easy meal plans, traditional Indian recipes, and dairy substitutes for your first vegan week.",
    author: "Manish Reddy",
    authorInitial: "MR",
    date: "May 28, 2026",
    readTime: "6 min read",
    content: `
      <h2>A Week of Compassionate Plant-Based Meals</h2>
      <p>Transitioning to veganism is incredibly easy with traditional Indian cuisine, which naturally features many plant-based staples.</p>

      <h3>7-Day Meal Outline</h3>
      <p><strong>Breakfast:</strong> Poha with peanuts, Idli with coconut chutney, or Oats Upma.</p>
      <p><strong>Lunch:</strong> Dal Tadka with Roti, Jeera Rice, and Aloo Gobi subji.</p>
      <p><strong>Dinner:</strong> Chana Masala with brown rice or Tofu Bhurji roll.</p>

      <h3>Replacing Ghee and Dairy</h3>
      <p>Use mustard oil, coconut oil, or sesame oil instead of ghee. Replace dairy curd with peanut-based or soy yogurt.</p>
    `
  },
  {
    slug: "protein-sources-for-vegans-in-india",
    category: "Vegan Living",
    title: "Protein Sources for Vegans in India — Dal, Paneer Alternative Guide",
    excerpt: "Discover plant-based protein boosters like tofu, edamame, lentils, and pulses popular in India.",
    author: "Nisha Sen",
    authorInitial: "NS",
    date: "May 25, 2026",
    readTime: "5 min read",
    content: `
      <h2>Meeting Your Daily Protein Requirements as a Vegan</h2>
      <p>Contrary to the myth that vegans lack protein, Indian plant foods offer rich amino acid profiles.</p>

      <h3>Top Vegan Protein Sources</h3>
      <ul>
        <li><strong>Lentils and Dals:</strong> Moong dal, Masoor dal, and Toor dal contain ~18g protein per cooked cup.</li>
        <li><strong>Chickpeas & Rajma:</strong> Traditional staples with 15g protein per serving.</li>
        <li><strong>Soy Tofu:</strong> The perfect substitute for Paneer with low fat and 20g protein per block.</li>
        <li><strong>Sattu (Roasted Chickpea Flour):</strong> A highly nutritious protein drink popular in North India.</li>
      </ul>
    `
  },
  {
    slug: "common-diseases-in-street-dogs-how-to-spot",
    category: "Animal Health",
    title: "Common Diseases in Street Dogs and How to Spot Them Early",
    excerpt: "Recognize symptoms of Canine Parvovirus, Distemper, Scabies, and Tick Fever to act in time.",
    author: "Dr. Amit Verma",
    authorInitial: "AV",
    date: "May 20, 2026",
    readTime: "6 min read",
    content: `
      <h2>Identifying Infections in Community Dogs</h2>
      <p>Early identification of viral diseases saves canine lives. Here is what to monitor in your community feeding circles.</p>

      <h3>1. Parvovirus</h3>
      <p>Look for bloody diarrhea, severe vomiting, lethargy, and a complete refusal to eat. Common in puppies and highly contagious.</p>

      <h3>2. Canine Distemper</h3>
      <p>Indicated by thick discharge from the eyes and nose, coughing, fever, and muscle twitches or fits.</p>

      <h3>3. Sarcoptic Mange (Scabies)</h3>
      <p>Severe hair loss, dry crusty skin, and constant scratching. Easily treated with Ivermectin or specialized dips under vet guidance.</p>
    `
  },
  {
    slug: "vaccination-schedule-for-rescued-animals",
    category: "Animal Health",
    title: "Vaccination Schedule for Rescued Animals — A Volunteer's Checklist",
    excerpt: "A guide to anti-rabies, DHPPi, and booster vaccines for street dogs and cats.",
    author: "Dr. Amit Verma",
    authorInitial: "AV",
    date: "May 18, 2026",
    readTime: "5 min read",
    content: `
      <h2>Immunization Protocols for Strays</h2>
      <p>Vaccinating community animals prevents local disease outbreaks. Ensure all rescued dogs get their primary shots.</p>

      <h3>Standard Puppy Schedule</h3>
      <p><strong>6-8 Weeks:</strong> DHPPi (7-in-1 combo vaccine against Distemper, Parvo, Hepatitis, etc.)</p>
      <p><strong>9-12 Weeks:</strong> Booster DHPPi + Anti-Rabies Vaccine (ARV)</p>
      <p><strong>Annually:</strong> Annual boosters for DHPPi and ARV.</p>
    `
  },
  {
    slug: "bringing-home-a-rescue-dog-first-30-days",
    category: "Adoption Tips",
    title: "Bringing Home a Rescue Dog: First 30 Days Guide",
    excerpt: "Tips on decompression, crate training, setting routines, and vetting for newly adopted street dogs.",
    author: "Kavya Reddy",
    authorInitial: "KR",
    date: "May 12, 2026",
    readTime: "5 min read",
    content: `
      <h2>The Decompression Phase: Rule of Three</h2>
      <p>Newly adopted street dogs need time to adjust. Expecting them to behave perfectly on day one is unrealistic.</p>

      <h3>The 3-3-3 Rule</h3>
      <p><strong>First 3 Days:</strong> The dog feels overwhelmed and may hide or refuse to eat. Be patient and give them space.</p>
      <p><strong>First 3 Weeks:</strong> They start realizing they are safe and begin showing their true personality traits.</p>
      <p><strong>First 3 Months:</strong> The dog forms a complete bond and feels fully settled in their new routine.</p>
    `
  },
  {
    slug: "how-to-introduce-a-rescue-cat-to-your-home",
    category: "Adoption Tips",
    title: "How to Introduce a Rescue Cat to Your Home",
    excerpt: "Make your home cat-safe, introduce litter boxes, and handle stress behaviors during rescue adoption.",
    author: "Kavya Reddy",
    authorInitial: "KR",
    date: "May 10, 2026",
    readTime: "4 min read",
    content: `
      <h2>Welcoming Your Rescued Feline</h2>
      <p>Cats are territorial animals. Changing environments causes them high stress. Follow these safe transition tips.</p>

      <h3>1. Start in a Single Room</h3>
      <p>Keep the new cat in a quiet spare bedroom or bathroom with their food, water, and litter box for the first week.</p>

      <h3>2. Scent Swapping</h3>
      <p>Rub a towel over your cat and place it in the living room, and vice-versa, so they get used to the household smells before exploring.</p>
    `
  },
  {
    slug: "ecoverse-launches-in-hyderabad",
    category: "News",
    title: "EcoVerse Launches in Hyderabad: 2 Volunteers, Infinite Compassion",
    excerpt: "EcoVerse marks its launch in Hyderabad, Telangana with local area coordinators.",
    author: "EcoVerse Editorial",
    authorInitial: "EE",
    date: "May 05, 2026",
    readTime: "3 min read",
    content: `
      <h2>EcoVerse Begins Local operations in Hyderabad</h2>
      <p>EcoVerse has officially launched its first pilot location in Hyderabad. With our custom 3-level area isolation mapping (State → City → Area), we aim to connect volunteers in areas like Banjara Hills and Madhapur to rescue stray animals faster than ever.</p>
      
      <p>Our team is onboarding local vets and animal welfare activists to streamline emergency dispatches.</p>
    `
  },
  {
    slug: "indias-animal-welfare-crisis",
    category: "News",
    title: "India's Animal Welfare Crisis: 30 Million Street Animals Need Our Help",
    excerpt: "An inside look into the stray animal population and why centralized rescue platforms are needed.",
    author: "EcoVerse Editorial",
    authorInitial: "EE",
    date: "May 01, 2026",
    readTime: "4 min read",
    content: `
      <h2>The Magnitude of the Stray Population in India</h2>
      <p>India is home to over 30 million stray dogs and millions of community cows and cats. Municipal services are heavily overwhelmed, leading to untreated injuries, diseases, and public conflict.</p>
      
      <h3>The Role of Centralized Platforms</h3>
      <p>Platforms like EcoVerse aggregate rescuer networks, allowing decentralized response coordination. This prevents duplicate alerts and connects injured street animals to immediate help.</p>
    `
  }
];
