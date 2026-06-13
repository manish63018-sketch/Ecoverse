"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/signup");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050f07", color: "#FFFFFF", fontFamily: "sans-serif" }}>
      <p style={{ color: "rgba(232, 245, 233, 0.6)" }}>Redirecting to signup...</p>
    </div>
  );
}
