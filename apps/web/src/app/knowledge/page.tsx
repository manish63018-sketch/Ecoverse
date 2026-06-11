"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  BookOpen, Heart, Shield, HelpCircle, 
  ChevronDown, ChevronUp, Search, Info, Phone, AlertTriangle 
} from "lucide-react";

// ── AdSense In-Article Ad Component ─────────────────────────────
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function AdSenseAd() {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div
      style={{
        margin: "32px 0",
        borderRadius: "14px",
        overflow: "hidden",
        background: "rgba(21, 35, 23, 0.3)",
        border: "1px solid rgba(102,187,106,0.08)",
        padding: "8px 0",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "0.65rem", color: "rgba(232,245,233,0.25)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Sponsored</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-8150181705727957"
        data-ad-slot="2091513690"
      />
    </div>
  );
}

interface GuideItem {
  id: string;
  title: string;
  excerpt: string;
  steps: string[];
  warnings?: string[];
}

interface GuideCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  guides: GuideItem[];
}

const KNOWLEDGE_CATEGORIES: GuideCategory[] = [
  {
    id: "first_aid",
    label: "Emergency First-Aid",
    icon: "🚑",
    description: "Crucial steps to stabilize injured animals before veterinary help arrives.",
    guides: [
      {
        id: "fa-1",
        title: "How to Treat Bleeding Wounds",
        excerpt: "Immediate pressure application and cleaning steps for cuts and active bleeding.",
        steps: [
          "Ensure your safety first. Wrap the animal gently in a towel or blanket if they are aggressive due to pain.",
          "Apply firm, continuous pressure to the bleeding wound using a clean cloth, sterile gauze, or bandage.",
          "Hold the pressure for at least 3-5 minutes without lifting to check if clotting has started.",
          "If blood leaks through, do not remove the cloth; add another layer on top and keep pressing.",
          "Clean the surrounding area with mild saline solution. Avoid putting raw alcohol or hydrogen peroxide directly on open tissue as it causes extreme pain.",
          "Contact the nearest animal ambulance or vet clinic immediately for stitches or antibiotics."
        ],
        warnings: [
          "Never apply a tourniquet (tight band) unless trained, as it can cause permanent tissue death.",
          "Do not try to clean deep arterial wounds yourself — keep pressing and rush to a clinic."
        ]
      },
      {
        id: "fa-2",
        title: "Stabilizing Bone Fractures",
        excerpt: "Keeping limbs immobilized to prevent further bone or nerve damage.",
        steps: [
          "Do not attempt to push a broken bone back into place.",
          "If the animal is lying down, try to keep them as still as possible to prevent shock.",
          "For limbs, wrap a thick layer of cotton wool or small towel around the leg.",
          "If you have a flat piece of wood or cardboard, use it as a splint by wrapping medical tape gently over it.",
          "Do not wrap the splint too tight, as it will cut off blood flow.",
          "Carefully slide a flat board (cardboard or wooden tray) under the animal to act as a stretcher for transport."
        ],
        warnings: [
          "Fractures are extremely painful. Keep your face away from the animal's mouth to prevent accidental bites.",
          "Do not apply wet ice packs directly to open bone fractures."
        ]
      },
      {
        id: "fa-3",
        title: "First-Aid for Heat Stroke",
        excerpt: "Cooling down stray dogs and cows experiencing extreme summer heat stroke.",
        steps: [
          "Move the animal to a cool, shaded area immediately.",
          "Wet the animal's body with cool (not freezing) water, focusing on the paws, stomach, and underarms.",
          "Place a wet towel under the animal rather than wrapping them in it (towels can trap body heat).",
          "Offer small sips of cool water or electrolyte water. Do not force-feed water if they are semi-conscious.",
          "Run a fan nearby if indoors, or gently fan them to encourage evaporative cooling.",
          "Monitor their breathing. Once stabilized, transport them to a vet clinic for IV hydration."
        ],
        warnings: [
          "Do not use ice-cold water or ice baths. Rapid cooling causes blood vessels to constrict, trapping heat inside."
        ]
      },
      {
        id: "fa-4",
        title: "Handling Suspected Poisoning",
        excerpt: "Counteracting toxins and preserving chemical evidence for treatment.",
        steps: [
          "Identify the poison source if possible (e.g. rat poison, engine oil, contaminated waste).",
          "Look for symptoms: excessive drooling, fits, vomiting, dilated pupils, or unconsciousness.",
          "If the poison was on the fur or skin, wash it off immediately with mild dish soap and plenty of water.",
          "Never induce vomiting unless explicitly instructed by a qualified veterinarian.",
          "Give the animal activated charcoal slurry if they are fully conscious (helps absorb toxins in the stomach).",
          "Rush to the vet with any packages or samples of the suspected poison."
        ],
        warnings: [
          "Do not force an unconscious or fitting animal to drink or vomit, as it will lead to suffocation (aspiration)."
        ]
      }
    ]
  },
  {
    id: "safe_feeding",
    label: "Safe Feeding Guides",
    icon: "🥣",
    description: "Nutritional guidelines on what is healthy and what is toxic for street animals.",
    guides: [
      {
        id: "sf-1",
        title: "Stray Dog Feeding Guide",
        excerpt: "Healthy, affordable foods for local community dogs.",
        steps: [
          "Safe staple foods: Cooked white/brown rice mixed with boiled pumpkin, carrots, or sweet potato.",
          "Protein options: Boiled boneless chicken, boiled eggs (crushed), or low-fat paneer.",
          "Curd rice: A highly soothing and cooling option, especially during summers.",
          "Always feed fresh water in clean bowls. Clean the feeding spots daily to maintain public hygiene."
        ],
        warnings: [
          "NEVER feed chocolate, onions, garlic, raisins, grapes, or artificial sweeteners (xylitol).",
          "Avoid feeding cooked bones (they splinter and tear the gut) or sugary biscuits (can cause diabetes/skin issues)."
        ]
      },
      {
        id: "sf-2",
        title: "Community Cat Feeding Guide",
        excerpt: "Essential dietary requirements for neighborhood cats.",
        steps: [
          "Cats are obligate carnivores and require animal protein to survive.",
          "Safe foods: Boiled boneless fish, boiled chicken, or commercial wet cat food.",
          "Ensure fresh water is kept in flat bowls (cats dislike deep bowls due to whisker fatigue)."
        ],
        warnings: [
          "Do NOT give cow's milk. Most adult cats are lactose intolerant and get severe diarrhea.",
          "Never feed raw fish or raw meat due to bacterial risk."
        ]
      },
      {
        id: "sf-3",
        title: "Street Cow Care & Nutrition",
        excerpt: "Feeding cows safely to avoid plastic ingestion and indigestion.",
        steps: [
          "Safe foods: Fresh grass, hay, green leafy vegetables (cabbage, spinach), and banana peels.",
          "Cereal grains: Bran, soaked oats, or chickpea husks in small quantities.",
          "Always serve food on clean plates or containers — never throw food inside plastic bags."
        ],
        warnings: [
          "Do not feed moldy bread, stale leftover rice, or plastic-covered wastes.",
          "Avoid feeding large quantities of raw potatoes or apples as they can block the throat."
        ]
      }
    ]
  },
  {
    id: "animal_laws",
    label: "Indian Animal Laws",
    icon: "⚖️",
    description: "Legal rights of feeders, animal protection laws, and how to report cruelty in India.",
    guides: [
      {
        id: "al-1",
        title: "Rights of Street Feeder Volunteers",
        excerpt: "Legal protections for citizens feeding street animals in India.",
        steps: [
          "Feeding stray animals is a constitutional duty of every citizen under Article 51A(g) of the Indian Constitution.",
          "The Animal Welfare Board of India (AWBI) issues official feeder cards. Feeders cannot be harassed or restricted.",
          "The Delhi High Court and Supreme Court have ruled that citizens have a right to feed stray dogs, and local residents cannot stop them.",
          "If harassed, you can lodge a police complaint under Section 503 and 506 of the IPC (criminal intimidation)."
        ]
      },
      {
        id: "al-2",
        title: "Key Laws Against Cruelty",
        excerpt: "The Prevention of Cruelty to Animals (PCA) Act, 1960 and Indian Penal Code sections.",
        steps: [
          "IPC Section 428 and 429: Killing, poisoning, maiming, or rendering useless any animal is a cognizable offense carrying up to 5 years imprisonment.",
          "PCA Act Section 11: Declares beating, kicking, overloading, torturing, or abandoning any animal as a punishable offense.",
          "Relocating stray dogs is illegal under the PCA Rules, 2001. Sterilized dogs must be returned to their original areas."
        ]
      },
      {
        id: "al-3",
        title: "How to File a Police FIR for Cruelty",
        excerpt: "Step-by-step process to report animal abuse and follow up.",
        steps: [
          "Gather clear evidence: Take photos, record videos, and secure statements from eye-witnesses.",
          "Draft a written complaint describing the date, time, location, culprit (if known), and specific acts of cruelty.",
          "Visit the nearest police station in the jurisdiction where the incident occurred.",
          "Ask the Station House Officer (SHO) to file an FIR under IPC 428/429 and PCA Section 11.",
          "If the police refuse to register the FIR, send a copy of your complaint to the Superintendent of Police (SP) or contact local animal welfare legal advocates."
        ]
      }
    ]
  }
];

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<string>("first_aid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  const toggleGuide = (guideId: string) => {
    setExpandedGuides((prev) => ({
      ...prev,
      [guideId]: !prev[guideId],
    }));
  };

  // Filter categories and guides based on search query
  const filteredCategories = KNOWLEDGE_CATEGORIES.map((cat) => {
    const matchingGuides = cat.guides.filter((guide) => {
      const matchText = (guide.title + " " + guide.excerpt + " " + guide.steps.join(" ")).toLowerCase();
      return matchText.includes(searchQuery.toLowerCase());
    });
    return {
      ...cat,
      guides: matchingGuides,
    };
  }).filter((cat) => cat.guides.length > 0);

  // Get active category for UI
  const currentCategory = KNOWLEDGE_CATEGORIES.find((cat) => cat.id === activeTab);

  return (
    <div style={{ background: "#050f07", minHeight: "100vh", color: "#FFFFFF", fontFamily: "var(--font-sans), sans-serif" }}>
      <Navbar />

      {/* Hero section */}
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(102, 187, 106, 0.08)", border: "1px solid rgba(102, 187, 106, 0.2)", padding: "6px 14px", borderRadius: "20px", color: "#A5D6A7", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase" }}>
            <BookOpen size={14} /> Knowledge Hub & First-Aid
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.03em", marginTop: "14px", marginBottom: "12px" }}>
            First-Aid & Legal Guides
          </h1>
          <p style={{ color: "var(--color-text-muted-dark)", fontSize: "1.1rem", maxWidth: "680px", margin: "0 auto", lineHeight: 1.6 }}>
            Empower yourself with certified veterinary first-aid procedures, stray animal feeding guidelines, and animal welfare laws in India.
          </p>
        </div>

        {/* Global Search */}
        <div style={{ maxWidth: "600px", margin: "0 auto 48px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(102,187,106,0.5)" }} />
          <input
            type="text"
            placeholder="Search guides (e.g., bleeding, fracture, laws, milk)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(21, 35, 23, 0.45)",
              border: "1px solid rgba(102,187,106,0.25)",
              borderRadius: "var(--radius-xl)",
              padding: "14px 16px 14px 48px",
              color: "#FFFFFF",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          />
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "40px" }} className="knowledge-layout">
          
          {/* Left Column: Navigation / Tabs & Quick Action Guide */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Category selection */}
            {!searchQuery && (
              <div
                style={{
                  background: "rgba(21, 35, 23, 0.45)",
                  border: "1px solid rgba(102,187,106,0.15)",
                  borderRadius: "var(--radius-xl)",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
                className="category-tabs"
              >
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(232,245,233,0.4)", textTransform: "uppercase", padding: "0 10px 8px" }}>
                  Categories
                </span>
                {KNOWLEDGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    style={{
                      background: activeTab === cat.id ? "rgba(102, 187, 106, 0.12)" : "transparent",
                      border: "none",
                      color: activeTab === cat.id ? "#A5D6A7" : "rgba(232, 245, 233, 0.75)",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      fontSize: "0.9rem",
                      fontWeight: activeTab === cat.id ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Action Guide Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(211,47,47,0.15) 0%, rgba(21, 35, 23, 0.45) 100%)",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                boxShadow: "0 10px 25px rgba(211,47,47,0.1)",
              }}
            >
              <div style={{ color: "#EF5350", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                <AlertTriangle size={16} /> Emergency SOS
              </div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "10px", marginBottom: "8px" }}>Is it a Life-Threatening Case?</h4>
              <p style={{ color: "rgba(232,245,233,0.6)", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "16px" }}>
                If you encounter an animal in critical shock, bleeding, or meeting an accident, report a case immediately.
              </p>
              <a
                href="/sos"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  background: "#EF5350",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(239,83,80,0.3)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
              >
                🚨 Report SOS Case
              </a>
            </div>

          </div>

          {/* Right Column: Guides Listing */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Search results banner */}
            {searchQuery && (
              <div style={{ fontSize: "0.9rem", color: "rgba(232,245,233,0.6)" }}>
                Showing search results for &ldquo;<strong style={{ color: "#66BB6A" }}>{searchQuery}</strong>&rdquo;
              </div>
            )}

            {/* List Guides */}
            {searchQuery ? (
              // Display filtered search results grouped by category
              filteredCategories.map((cat) => (
                <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "1.2rem" }}>{cat.icon}</span>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#A5D6A7" }}>{cat.label}</h3>
                  </div>
                  {cat.guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      isExpanded={!!expandedGuides[guide.id]}
                      onToggle={() => toggleGuide(guide.id)}
                    />
                  ))}
                </div>
              ))
            ) : (
              // Display guides of active tab
              currentCategory && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "14px" }}>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: 800 }}>{currentCategory.label}</h2>
                    <p style={{ color: "rgba(232,245,233,0.55)", fontSize: "0.88rem", marginTop: "4px" }}>{currentCategory.description}</p>
                  </div>

                  {currentCategory.guides.map((guide, idx) => (
                    <React.Fragment key={guide.id}>
                      <GuideCard
                        guide={guide}
                        isExpanded={!!expandedGuides[guide.id]}
                        onToggle={() => toggleGuide(guide.id)}
                      />
                      {/* Insert AdSense ad after the 2nd guide */}
                      {idx === 1 && <AdSenseAd />}
                    </React.Fragment>
                  ))}

                  {/* Donation banner below guides */}
                  <a
                    href="/donate"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      background: "linear-gradient(135deg, rgba(102,187,106,0.12) 0%, rgba(21,35,23,0.6) 100%)",
                      border: "1px solid rgba(102,187,106,0.25)",
                      borderRadius: "var(--radius-xl)",
                      padding: "20px 24px",
                      textDecoration: "none",
                      transition: "all 0.25s",
                      marginTop: "8px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(102,187,106,0.5)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(102,187,106,0.25)")}
                  >
                    <span style={{ fontSize: "2rem" }}>🐾</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#A5D6A7", margin: 0 }}>Ads support animal medical care</p>
                      <p style={{ fontSize: "0.8rem", color: "rgba(232,245,233,0.5)", margin: "2px 0 0" }}>Every visit helps fund treatment for injured stray animals → Learn more</p>
                    </div>
                  </a>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      <Footer />

      {/* Page layout style */}
      <style>{`
        @media (max-width: 800px) {
          .knowledge-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}

// ── GuideCard Component ──────────────────────────────────────────
function GuideCard({
  guide, isExpanded, onToggle
}: {
  guide: GuideItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(21, 35, 23, 0.45)",
        border: `1px solid ${isExpanded ? "rgba(102,187,106,0.25)" : "rgba(102,187,106,0.12)"}`,
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          padding: "20px 24px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF" }}>{guide.title}</h4>
          <p style={{ color: "rgba(232,245,233,0.55)", fontSize: "0.85rem", marginTop: "4px" }}>{guide.excerpt}</p>
        </div>
        <div style={{ color: "rgba(102,187,106,0.6)", display: "flex" }}>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{ padding: "0 24px 24px 24px", borderTop: "1px solid rgba(102,187,106,0.08)" }}>
          
          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#66BB6A", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Action Steps
            </span>
            {guide.steps.map((step, idx) => (
              <div key={idx} style={{ display: "flex", gap: "12px", fontSize: "0.88rem", lineHeight: 1.5, color: "rgba(232,245,233,0.8)" }}>
                <span style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(102,187,106,0.12)", border: "1px solid rgba(102,187,106,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 800, color: "#A5D6A7", flexShrink: 0, marginTop: "2px"
                }}>
                  {idx + 1}
                </span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {guide.warnings && guide.warnings.length > 0 && (
            <div
              style={{
                background: "rgba(211,47,47,0.06)",
                border: "1px solid rgba(211,47,47,0.2)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span style={{ color: "#EF5350", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em", display: "flex", alignItems: "center", gap: "6px" }}>
                ⚠️ CRITICAL WARING / AVOID
              </span>
              {guide.warnings.map((warn, idx) => (
                <div key={idx} style={{ fontSize: "0.8rem", color: "rgba(239,154,154,0.85)", lineHeight: 1.4, display: "flex", gap: "6px" }}>
                  <span>•</span> <p>{warn}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
