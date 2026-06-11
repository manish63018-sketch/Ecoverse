import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — EcoVerse",
  description: "Read EcoVerse's Terms of Service. By using our platform, you agree to these terms governing your use of India's animal welfare community platform.",
};

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p style={{ color: "rgba(232,245,233,0.55)", marginTop: "12px", lineHeight: 1.7 }}>
            Last updated: June 2026 &nbsp;|&nbsp; Effective for ecoverseindia.web.app
          </p>
          <p style={{ color: "rgba(232,245,233,0.7)", marginTop: "16px", lineHeight: 1.8 }}>
            Welcome to EcoVerse. By accessing or using our platform at ecoverseindia.web.app, you agree to be bound by these Terms of Service. Please read them carefully. EcoVerse is built and maintained by <strong style={{ color: "#66BB6A" }}>mannish_2323 / Anti Gravity Studio</strong>.
          </p>
        </div>

        <LegalSection title="1. Eligibility">
          <LegalParagraph>
            EcoVerse is available to users who are 13 years of age or older and are based in India. By using our platform, you confirm that you meet these requirements. If you are under 18, you should use EcoVerse with parental awareness.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. User Conduct">
          <LegalParagraph>
            You agree to use EcoVerse only for lawful purposes and in a manner that does not infringe on the rights of others. The following conduct is strictly prohibited:
          </LegalParagraph>
          <LegalList items={[
            "Submitting false, fake, or misleading animal rescue reports",
            "Impersonating another user, volunteer, NGO, or organization",
            "Creating fake NGO listings or rescue organizations",
            "Posting abusive, harassing, or threatening content toward any user",
            "Sharing the personal address, phone number, or private information of any individual without their consent (doxxing)",
            "Using the platform to spam, collect unauthorized data, or run bots",
            "Posting content that incites mob targeting, public shaming, or harassment campaigns",
            "Uploading content that violates Indian law",
          ]} />
        </LegalSection>

        <LegalSection title="3. Content Ownership & License">
          <LegalParagraph>
            You retain ownership of all content you post on EcoVerse (photos, descriptions, rescue reports). By posting, you grant EcoVerse a non-exclusive, worldwide, royalty-free license to display, reproduce, and distribute your content solely for the purpose of operating and improving the platform.
          </LegalParagraph>
          <LegalParagraph>
            We will never sell your content or use it for advertising without your explicit consent.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="4. Emergency Rescue Disclaimer">
          <LegalParagraph>
            EcoVerse is a coordination platform — we connect people who want to help animals with those who need help. <strong style={{ color: "#FFA726" }}>We are not a licensed animal rescue organization and are not responsible for the outcome of any rescue attempt.</strong>
          </LegalParagraph>
          <LegalParagraph>
            Volunteers and rescuers on the platform act independently. EcoVerse does not guarantee that a rescue case will be responded to, or that any outcome will occur. For life-threatening emergencies involving humans, always contact the police (100) or ambulance (108) first.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="5. Account Termination">
          <LegalParagraph>
            We reserve the right to suspend or permanently terminate your account without prior notice if you violate these Terms, engage in harmful behavior, or abuse our platform. You may also delete your own account at any time from your account settings.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="6. Limitation of Liability">
          <LegalParagraph>
            EcoVerse and its maintainers (Anti Gravity Studio / mannish_2323) are not liable for any indirect, incidental, or consequential damages resulting from your use of the platform. Our platform is provided &quot;as is&quot; without warranties of any kind.
          </LegalParagraph>
          <LegalParagraph>
            We do our best to keep EcoVerse running smoothly, but we cannot guarantee uninterrupted service.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="7. Modifications to Terms">
          <LegalParagraph>
            We may update these Terms from time to time. Significant changes will be communicated via email or in-app notification. Continued use of EcoVerse after changes constitutes acceptance of the new Terms.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Governing Law">
          <LegalParagraph>
            These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="9. Contact">
          <LegalParagraph>
            Questions about these Terms? Reach us at:<br />
            📧 <a href="mailto:support@ecoverseindia.web.app" style={{ color: "#66BB6A" }}>support@ecoverseindia.web.app</a><br />
            📸 Instagram: <a href="https://instagram.com/mannish_2323" target="_blank" rel="noopener noreferrer" style={{ color: "#66BB6A" }}>@mannish_2323</a>
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
