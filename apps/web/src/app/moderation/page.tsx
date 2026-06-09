import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation Policy — EcoVerse",
  description: "EcoVerse's transparent community moderation policy. How we handle rescue reports, content reviews, violations, and appeals.",
};

export default function ModerationPolicyPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1a0e",
        color: "#E8F5E9",
        fontFamily: "var(--font-sans), sans-serif",
        padding: "80px 24px 120px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{ color: "#66BB6A", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "48px" }}
        >
          ← Back to EcoVerse
        </Link>

        <div style={{ marginBottom: "56px", borderBottom: "1px solid rgba(102,187,106,0.15)", paddingBottom: "32px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#66BB6A" }}>
            Legal
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.025em" }}>
            Moderation Policy
          </h1>
          <p style={{ color: "rgba(232,245,233,0.55)", marginTop: "12px", lineHeight: 1.7 }}>
            Last updated: June 2026 &nbsp;|&nbsp; Effective for ecoverse.in
          </p>
          <p style={{ color: "rgba(232,245,233,0.7)", marginTop: "16px", lineHeight: 1.8 }}>
            EcoVerse is a compassionate, trust-first community. Our moderation policy exists to protect animals, our users, and the integrity of emergency rescue operations. We are firm about safety while remaining transparent and fair.
          </p>
        </div>

        <LegalSection title="1. What Content Is Allowed">
          <LegalList items={[
            "Genuine animal rescue case reports with accurate information",
            "Volunteer availability updates and rescue coordination",
            "Legitimate NGO and organization profiles (must be verifiable)",
            "Animal adoption listings with honest descriptions",
            "Community posts, tips, and discussions about animal welfare and veganism",
            "Educational content, awareness campaigns, and fundraising for verified causes",
          ]} />
        </LegalSection>

        <LegalSection title="2. What Is Not Allowed">
          <LegalParagraph>
            The following content will be removed and may result in account action:
          </LegalParagraph>
          <LegalList items={[
            "False or fabricated rescue reports — even with good intentions, fake reports waste volunteer time and may delay real rescues",
            "Fake NGO or organization listings",
            "Sharing the personal address, full name, or identity of any individual without consent — even in cruelty reporting",
            "Graphic animal cruelty videos or images without a proper content warning — always add CW before sharing disturbing media",
            "Content that incites mob targeting, harassment campaigns, or public shaming of any individual",
            "Spam, repetitive posts, or automated content",
            "Misinformation about animal care, medication, or emergency procedures",
          ]} />
        </LegalSection>

        <LegalSection title="3. How Reports Are Reviewed">
          <LegalParagraph>
            All content reports are reviewed by our human moderation team. Our review process follows this timeline:
          </LegalParagraph>
          <LegalList items={[
            "All reports are acknowledged within 24 hours",
            "Standard moderation decisions are made within 24–48 hours",
            "Cruelty evidence reports (photos/videos) are reviewed privately before any action or sharing",
            "SOS rescue case reports are given priority review if flagged as potentially false",
          ]} />
        </LegalSection>

        <LegalSection title="4. Consequences for Violations">
          <LegalParagraph>
            We follow a progressive consequence system:
          </LegalParagraph>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {[
              { level: "1st violation", action: "Formal warning + content removal", color: "#FFA726" },
              { level: "Repeat or serious violation", action: "Temporary account suspension (7–30 days)", color: "#FF7043" },
              { level: "Severe or persistent violation", action: "Permanent account ban and data review", color: "#EF5350" },
            ].map((item) => (
              <div key={item.level} style={{
                display: "flex",
                gap: "16px",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                border: `1px solid ${item.color}33`,
              }}>
                <span style={{ fontWeight: 700, color: item.color, minWidth: "180px", fontSize: "0.875rem" }}>{item.level}</span>
                <span style={{ color: "rgba(232,245,233,0.7)", fontSize: "0.875rem" }}>{item.action}</span>
              </div>
            ))}
          </div>
          <LegalParagraph>
            In cases involving serious animal cruelty or criminal activity, we may cooperate with relevant Indian authorities when legally required to do so.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="5. Cruelty Evidence — Handled with Care">
          <LegalParagraph>
            When users submit evidence of animal cruelty (photos, videos, location information):
          </LegalParagraph>
          <LegalList items={[
            "All evidence is kept private by default — never automatically published",
            "Our moderation team reviews it before any action is taken",
            "We do not enable doxxing of accused individuals, even in clear cruelty cases",
            "We may assist in connecting users with the relevant animal welfare authorities (AWO, PCA) for formal complaints",
            "Graphic media is never displayed without an explicit content warning",
          ]} />
        </LegalSection>

        <LegalSection title="6. How to Appeal a Moderation Decision">
          <LegalParagraph>
            We make mistakes. If you believe a moderation action taken against your account or content was incorrect, you may appeal by:
          </LegalParagraph>
          <LegalList items={[
            "Emailing us at appeals@ecoverse.in with your username and a description of the decision",
            "We will review all appeals within 72 hours",
            "Appeals are reviewed by a different team member than the original moderator",
            "You will receive a written explanation of the final decision",
          ]} />
        </LegalSection>

        <LegalSection title="7. Our Commitment">
          <LegalParagraph>
            EcoVerse will never enable, facilitate, or participate in:
          </LegalParagraph>
          <LegalList items={[
            "Harassment campaigns against any individual, even one accused of cruelty",
            "Mob targeting or coordinated attacks on any person",
            "Publishing personal information of any user without explicit consent",
            "Suppressing genuine cruelty reports for any reason",
          ]} />
          <LegalParagraph>
            Our goal is a safe, compassionate community where every animal — and every human — can trust EcoVerse to act with integrity.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Contact Moderation Team">
          <LegalParagraph>
            To report content, appeal a decision, or raise a concern:<br />
            📧 <a href="mailto:moderation@ecoverse.in" style={{ color: "#66BB6A" }}>moderation@ecoverse.in</a><br />
            Appeals: <a href="mailto:appeals@ecoverse.in" style={{ color: "#66BB6A" }}>appeals@ecoverse.in</a>
          </LegalParagraph>
        </LegalSection>
      </div>
    </div>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#A5D6A7", marginBottom: "16px", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function LegalParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "rgba(232,245,233,0.75)", lineHeight: 1.8, marginBottom: "12px", fontSize: "0.95rem" }}>
      {children}
    </p>
  );
}

function LegalList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: "20px", margin: "0 0 16px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: "rgba(232,245,233,0.7)", lineHeight: 1.7, fontSize: "0.9rem" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}
