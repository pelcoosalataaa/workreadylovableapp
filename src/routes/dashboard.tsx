import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopBar, PrimaryBtn } from "@/components/AppTopBar";
import { InvitePersonalModal } from "@/components/InvitePersonalModal";
import {
  AlertCircle,
  Check,
  Clock,
  Layers,
  ShieldAlert,
  FileText,
  ArrowUp,
  Plus,
  Sun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudLightning,
  Snowflake,
  MapPin,
  Circle,
} from "lucide-react";
import { STORAGE_KEY } from "@/lib/departments";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const PAGE_BG = "#f0f2f5";
const CARD_BG = "#fff";
const CARD_BORDER = "1px solid #e5e7eb";
const CARD_RADIUS = 10;
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.06)";

function DashboardPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      const vald = localStorage.getItem(STORAGE_KEY);
      if (!vald) {
        navigate({ to: "/avdelning" });
        return;
      }
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <div style={{ minHeight: "100vh", background: PAGE_BG }} />;

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, display: "flex" }}>
      <AppSidebar />
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>
        <AppTopBar
          title="Dashboard"
          action={
            <PrimaryBtn onClick={() => setInviteOpen(true)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} /> Bjud in personal
              </span>
            </PrimaryBtn>
          }
        />
        <main style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <WelcomeRow />
          <ActionsRequired />
          <StatsRow />
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16 }}>
            <DepartmentReadinessCard />
            <ActivityCard />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <UpcomingOnboardingsCard />
            <ModulesCard />
          </div>
        </main>
        <InvitePersonalModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      </div>
      <style>{`
        @keyframes mintPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .mint-pulse{animation:mintPulse 1.5s infinite}
      `}</style>
    </div>
  );
}

function WelcomeRow() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [stats, setStats] = useState<{ ready: number; total: number } | null>(null);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=58.07&longitude=12.02&current=temperature_2m,weathercode&timezone=Europe/Stockholm")
      .then((r) => r.json())
      .then((d) => setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weathercode }))
      .catch(() => {});
    supabase.from("personal").select("status", { count: "exact" }).then(({ data }) => {
      if (!data) return;
      const total = data.length;
      const ready = data.filter((r: { status: string }) => r.status === "redo").length;
      setStats({ ready, total });
    });
  }, []);

  const now = new Date();
  const weekdays = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];
  const weekday = weekdays[now.getDay()];
  const h = now.getHours();
  const greeting = h < 6 ? "God natt" : h < 12 ? "God morgon" : h < 18 ? "God eftermiddag" : "God kväll";

  const weatherMeta = (code: number): { Icon: typeof Sun; color: string; label: string } => {
    if (code === 0) return { Icon: Sun, color: "#f59e0b", label: "Klart" };
    if ([1, 2, 3].includes(code)) return { Icon: Cloud, color: "#6b7280", label: "Lätt molnigt" };
    if ([45, 48].includes(code)) return { Icon: CloudFog, color: "#9ca3af", label: "Dimma" };
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { Icon: CloudRain, color: "#3b82f6", label: code >= 80 ? "Regnskurar" : "Regn" };
    if ([71, 73, 75, 77].includes(code)) return { Icon: Snowflake, color: "#60b0f4", label: "Snö" };
    if ([95, 96, 99].includes(code)) return { Icon: CloudLightning, color: "#6d28d9", label: "Åska" };
    return { Icon: Cloud, color: "#6b7280", label: "—" };
  };
  const wm = weather ? weatherMeta(weather.code) : null;

  return (
    <div style={{ background: CARD_BG, border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px 28px", marginBottom: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={13} color="#9ca3af" />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {weekday} · Ucklum, Sverige
          </span>
        </div>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, color: "#111827", margin: 0 }}>
          {greeting}, Johan
        </h2>
        <div style={{ width: 36, height: 3, background: "#0b1e2d", borderRadius: 2, margin: "10px 0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Circle size={8} color="#10b981" fill="#10b981" />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#6b7280" }}>
            {stats ? `${stats.ready} av ${stats.total} medarbetare redo för dagens skift` : "Laddar..."}
          </span>
        </div>
      </div>
      <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        {wm && <wm.Icon size={40} color={wm.color} strokeWidth={1.75} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 48, color: "#111827", lineHeight: 1 }}>
            {weather ? `${weather.temp}°` : "—°"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 12, color: "#374151" }}>Ucklum</span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#6b7280" }}>{wm?.label ?? ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type ActionItem = { text: string; to: string; search?: Record<string, string> };

function ActionsRequired() {
  const navigate = useNavigate();
  const items: ActionItem[] = [
    { text: "Sara Berg har inte påbörjat sin utbildning", to: "/arbetskraft", search: { filter: "ej-start" } },
    { text: "Lisa Bergström är 45% klar — börjar snart", to: "/arbetskraft", search: { filter: "pagar" } },
    { text: "Mohammed Al-Hassan har inte påbörjat sin utbildning", to: "/arbetskraft", search: { filter: "ej-start" } },
    { text: "Erik Holms traverskort utgår om 14 dagar", to: "/certifikat", search: { filter: "utgaende" } },
  ];
  return (
    <section
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: CARD_RADIUS,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#991b1b", margin: 0 }}>Åtgärder krävs nu</h3>
        <span
          style={{
            background: "#ef4444",
            color: "#fff",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
          }}
        >
          {items.length}
        </span>
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: i === items.length - 1 ? "none" : "1px solid #fecaca",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#ef4444", flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{it.text}</span>
          <button
            type="button"
            onClick={() => navigate({ to: it.to, search: (it.search ?? {}) as never })}
            style={{
              background: "transparent",
              border: "none",
              color: "#dc2626",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Åtgärda →
          </button>
        </div>
      ))}
    </section>
  );
}

function StatsRow() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ total: 0, redo: 0, pagar: 0, ej: 0 });

  useEffect(() => {
    supabase
      .from("personal")
      .select("status")
      .then(({ data }) => {
        const rows = data ?? [];
        const total = rows.length;
        const redo = rows.filter((r) => r.status === "redo").length;
        const pagar = rows.filter((r) => r.status === "pagaende" || r.status === "pagar").length;
        const ej = rows.filter((r) => r.status === "ej_paborjat").length;
        setCounts({ total, redo, pagar, ej });
      });
  }, []);

  const pctRedo = counts.total ? Math.round((counts.redo / counts.total) * 100) : 0;
  const stats = [
    { color: "#3b82f6", label: "TOTAL ARBETSKRAFT", value: String(counts.total), sub: "medarbetare", to: "/arbetskraft", search: {} },
    { color: "#10b981", label: "REDO FÖR ARBETE", value: String(counts.redo), sub: `${pctRedo}% av alla`, to: "/arbetskraft", search: { filter: "redo" } },
    { color: "#f59e0b", label: "UNDER UPPLÄRNING", value: String(counts.pagar), sub: "Pågår just nu", to: "/arbetskraft", search: { filter: "pagar" } },
    { color: "#ef4444", label: "EJ PÅBÖRJAT", value: String(counts.ej), sub: "Kräver åtgärd", to: "/arbetskraft", search: { filter: "ej-start" } },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {stats.map((s) => (
        <div
          key={s.label}
          role="button"
          tabIndex={0}
          onClick={() => navigate({ to: s.to, search: s.search as never })}
          style={{
            background: CARD_BG,
            border: CARD_BORDER,
            borderLeft: `4px solid ${s.color}`,
            borderRadius: CARD_RADIUS,
            boxShadow: CARD_SHADOW,
            padding: 20,
            cursor: "pointer",
            transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = CARD_SHADOW)}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {s.label}
          </div>
          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              color: s.color,
              lineHeight: 1.1,
              margin: "8px 0 4px",
            }}
          >
            {s.value}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function CardShell({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD_BG, border: CARD_BORDER, borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 14, color: "#111827", margin: 0 }}>{title}</h3>
        {right}
      </div>
      <div style={{ padding: "8px 20px 16px" }}>{children}</div>
    </div>
  );
}

function DepartmentReadinessCard() {
  const navigate = useNavigate();
  const departments = [
    { name: "Snickeriavdelning / Formbyggnad", count: 6, pct: 83, slug: "snickeri" },
    { name: "Gul hallen", count: 8, pct: 75, slug: "gul-hallen" },
    { name: "Rosa hallen", count: 5, pct: 60, slug: "rosa-hallen" },
    { name: "Gröna hallen", count: 4, pct: 100, slug: "grona-hallen" },
    { name: "Armeringsavdelning", count: 6, pct: 50, slug: "armering" },
    { name: "Lap och Lag", count: 3, pct: 33, slug: "lap-och-lag" },
  ];
  const colorFor = (p: number) => (p > 80 ? "#10b981" : p >= 50 ? "#f59e0b" : "#ef4444");
  return (
    <CardShell
      title="Beredskap per avdelning"
      right={<span style={{ fontSize: 12, color: "#6b7280" }}>Uppdaterad nu</span>}
    >
      {departments.map((d) => {
        const color = colorFor(d.pct);
        return (
          <div
            key={d.slug}
            role="button"
            tabIndex={0}
            onClick={() => navigate({ to: "/arbetskraft", search: { avdelning: d.slug } as never })}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{d.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{d.count} pers</div>
            </div>
            <div
              style={{
                flex: 1,
                height: 6,
                background: "#f3f4f6",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div style={{ width: `${d.pct}%`, height: "100%", background: color, transition: "width .2s" }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color, width: 48, textAlign: "right" }}>{d.pct}%</div>
          </div>
        );
      })}
    </CardShell>
  );
}

function ActivityCard() {
  const items = [
    { type: "ok", title: "Anders Johansson godkänd", sub: "Säkerhet · 4/4 rätt", time: "08:14" },
    { type: "ok", title: "SMS skickat — Sara Berg", sub: "Påminnelse skickad", time: "09:00" },
    { type: "pending", title: "AI bygger modul — Traverskörning", sub: "Pågår · ~2 min", time: "Nu" },
    { type: "neutral", title: "Veckorapport planerad", sub: "Fredag 08:00", time: "Fre" },
    { type: "alert", title: "Erik Holms certifikat", sub: "Traverskort · 14 dagar kvar", time: "Snart" },
  ] as const;
  const styleFor = (t: string) => {
    if (t === "ok") return { bg: "#d1fae5", color: "#065f46", icon: <Check size={14} /> };
    if (t === "pending") return { bg: "#fef3c7", color: "#92400e", icon: <Clock size={14} /> };
    if (t === "alert") return { bg: "#fee2e2", color: "#991b1b", icon: <AlertCircle size={14} /> };
    return { bg: "#f3f4f6", color: "#374151", icon: <Clock size={14} /> };
  };
  return (
    <CardShell
      title="Senaste aktivitet"
      right={
        <span
          style={{
            background: "#d1fae5",
            color: "#065f46",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Live
        </span>
      }
    >
      {items.map((it, i) => {
        const s = styleFor(it.type);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 0",
              borderBottom: i === items.length - 1 ? "none" : "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: s.bg,
                color: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{it.title}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{it.sub}</div>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>{it.time}</div>
          </div>
        );
      })}
    </CardShell>
  );
}

function Badge({ children, kind }: { children: React.ReactNode; kind: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const map = {
    success: { bg: "#d1fae5", color: "#065f46" },
    warning: { bg: "#fef3c7", color: "#92400e" },
    danger: { bg: "#fee2e2", color: "#991b1b" },
    info: { bg: "#dbeafe", color: "#1e40af" },
    neutral: { bg: "#f3f4f6", color: "#374151" },
  } as const;
  const s = map[kind];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function UpcomingOnboardingsCard() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const rows = [
    { initials: "SB", color: "#ef4444", name: "Sara Berg", role: "Betongarbetare", start: "Måndag 19 maj", status: "Ej påbörjat", kind: "danger" as const },
    { initials: "LB", color: "#f59e0b", name: "Lisa Bergström", role: "Formbyggare", start: "Tisdag 20 maj", status: "45% klar", kind: "warning" as const },
    { initials: "MA", color: "#ef4444", name: "Mohammed Al-Hassan", role: "Betongarbetare", start: "Onsdag 21 maj", status: "Ej påbörjat", kind: "danger" as const },
  ];
  return (
    <>
      <CardShell
        title="Kommande onboardingar"
        right={
          <PrimaryBtn
            onClick={() => setInviteOpen(true)}
            style={{ padding: "6px 12px", fontSize: 12 }}
          >
            + Lägg till
          </PrimaryBtn>
        }
      >
        {rows.map((r) => (
          <div
            key={r.initials}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: r.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {r.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{r.role}</div>
            </div>
            <Badge kind="neutral">{r.start}</Badge>
            <Badge kind={r.kind}>{r.status}</Badge>
          </div>
        ))}
        <div style={{ paddingTop: 12 }}>
          <Link
            to="/arbetskraft"
            style={{ fontSize: 13, color: "#0b1e2d", fontWeight: 600, textDecoration: "none" }}
          >
            Visa alla →
          </Link>
        </div>
      </CardShell>
      <InvitePersonalModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

function ModulesCard() {
  const navigate = useNavigate();
  const rows = [
    { icon: <Layers size={16} />, color: "#14b8a6", title: "Introduktion betong", meta: "27/27 klara", kind: "success" as const, badge: "Klar" },
    { icon: <ShieldAlert size={16} />, color: "#f59e0b", title: "Säkerhet & skydd", meta: "27/27 klara", kind: "success" as const, badge: "Klar" },
    { icon: <FileText size={16} />, color: "#3b82f6", title: "Ritningsläsning", meta: "19/27 klara", kind: "warning" as const, badge: "Pågår" },
    { icon: <ArrowUp size={16} />, color: "#6b7280", title: "Traverskörning", meta: "AI skapar...", kind: "warning" as const, badge: "Pågår" },
  ];
  return (
    <CardShell
      title="Utbildningsmoduler"
      right={
        <button
          onClick={() => navigate({ to: "/utbildning" })}
          style={{ background: "transparent", border: "none", fontSize: 13, color: "#0b1e2d", fontWeight: 600, cursor: "pointer" }}
        >
          Spela in ny →
        </button>
      }
    >
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: `${r.color}1a`,
              color: r.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {r.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.title}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{r.meta}</div>
          </div>
          <Badge kind={r.kind}>
            <span className={r.title === "Traverskörning" ? "mint-pulse" : undefined}>{r.badge}</span>
          </Badge>
        </div>
      ))}
      <div style={{ paddingTop: 12 }}>
        <Link
          to="/utbildning"
          style={{ fontSize: 13, color: "#0b1e2d", fontWeight: 600, textDecoration: "none" }}
        >
          Visa alla moduler →
        </Link>
      </div>
    </CardShell>
  );
}
