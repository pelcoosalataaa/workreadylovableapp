import { Bell } from "lucide-react";
import type { ReactNode } from "react";

export function AppTopBar({
  title,
  date = "Lördag, 16 maj 2026",
  action,
  initials = "LJ",
}: {
  title: string;
  date?: string;
  action?: ReactNode;
  initials?: string;
}) {
  return (
    <header
      style={{
        height: 64,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", margin: 0 }}>
        {title}
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{date}</span>
        <button
          type="button"
          aria-label="Notifieringar"
          style={{
            position: "relative",
            background: "transparent",
            border: "none",
            padding: 6,
            cursor: "pointer",
            color: "#374151",
          }}
        >
          <Bell size={18} strokeWidth={1.75} />
          <span
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#ef4444",
            }}
          />
        </button>
        {action}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "#0b1e2d",
            color: "#7dedb8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export function PrimaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "#0b1e2d",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        ...(props.style ?? {}),
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3d58")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#0b1e2d")}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "#fff",
        color: "#374151",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 20px",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        cursor: "pointer",
        ...(props.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}
