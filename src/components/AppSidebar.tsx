import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Grid3x3,
  ShieldCheck,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = { Icon: LucideIcon; label: string; to: string; badge?: number };

const baseNavItems: NavItem[] = [
  { Icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { Icon: Users, label: "Arbetskraft", to: "/arbetskraft" },
  { Icon: GraduationCap, label: "Utbildning & Onboarding", to: "/utbildning" },
  { Icon: Grid3x3, label: "Kompetensmatris", to: "/kompetensmatris" },
  { Icon: ShieldCheck, label: "Certifikat & Efterlevnad", to: "/certifikat" },
  { Icon: Building2, label: "Bemanningspartners", to: "/bemanningspartners" },
  { Icon: Settings, label: "Inställningar", to: "/installningar" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ejBadge, setEjBadge] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { count } = await supabase
        .from("personal")
        .select("id", { count: "exact", head: true })
        .eq("status", "ej_paborjat");
      if (!cancelled) setEjBadge(count ?? 0);
    };
    load();
    return () => { cancelled = true; };
  }, [pathname]);

  const navItems: NavItem[] = baseNavItems.map((item) =>
    item.to === "/arbetskraft" && ejBadge && ejBadge > 0 ? { ...item, badge: ejBadge } : item
  );


  return (
    <aside
      className="fixed top-0 left-0 bottom-0 flex flex-col"
      style={{ width: 260, background: "#0b1e2d", borderRight: "1px solid #1a3d58" }}
    >
      <div style={{ padding: 20, borderBottom: "1px solid #1a3d58" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#fff" }}>
          WorkReady
        </div>
        <div style={{ marginTop: 4, fontSize: 10, color: "#7dedb8", fontWeight: 600, letterSpacing: "0.06em" }}>
          by Partner2Work AB
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map((item) => {
          const active = pathname === item.to;
          const Icon = item.Icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "#7dedb8" : "#5a8a9a",
                background: active ? "rgba(125,237,184,0.08)" : "transparent",
                borderLeft: active ? "3px solid #7dedb8" : "3px solid transparent",
                paddingLeft: active ? 9 : 12,
                cursor: "pointer",
                transition: "color .15s, background .15s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "#5a8a9a";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? (
                <span
                  style={{
                    background: "#7dedb8",
                    color: "#0b1e2d",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid #1a3d58", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#7dedb8",
            color: "#0b1e2d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          BE
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Byggelement AB</div>
          <div style={{ fontSize: 11, color: "#5a8a9a" }}>Ucklum · Admin</div>
        </div>
      </div>
    </aside>
  );
}

export const sidebarKeyframes = `
  @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,224,150,0.6)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(0,224,150,0)} }
  @keyframes redPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,77,106,0.5)} 50%{opacity:.5;box-shadow:0 0 0 6px rgba(255,77,106,0)} }
  @keyframes mintPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .live-dot{width:8px;height:8px;border-radius:999px;background:#00e096;animation:livePulse 2s infinite}
  .red-dot{width:8px;height:8px;border-radius:999px;background:#ff4d6a;animation:redPulse 1.6s infinite}
  .mint-pulse{animation:mintPulse 1.5s infinite}
  .shimmer-bar{background:linear-gradient(90deg,#e5e7eb,#f59e0b,#e5e7eb);background-size:200% 100%;animation:shimmer 2s linear infinite}
  .mono{font-family:'Space Mono',ui-monospace,monospace;letter-spacing:.08em}
`;
