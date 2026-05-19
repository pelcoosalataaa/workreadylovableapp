import { AppSidebar } from "@/components/AppSidebar";
import { AppTopBar } from "@/components/AppTopBar";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LightAppShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex" }}>
      <AppSidebar />
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>
        <AppTopBar title={title} action={action} />
        <main style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function LightPlaceholderCard({
  heading,
  description,
  legacyHref,
  legacyLabel,
}: {
  heading: string;
  description: string;
  legacyHref?: string;
  legacyLabel?: string;
}) {
  const navigate = useNavigate();
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        padding: 32,
      }}
    >
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", margin: 0 }}>
        {heading}
      </h2>
      <p style={{ fontSize: 13, color: "#374151", marginTop: 8, maxWidth: 620 }}>{description}</p>
      {legacyHref && (
        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={() => navigate({ to: legacyHref as never })}
            style={{
              background: "#0b1e2d",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {legacyLabel ?? "Öppna"} →
          </button>
        </div>
      )}
    </section>
  );
}
