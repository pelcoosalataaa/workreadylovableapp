import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { toast } from "sonner";
import {
  Layers,
  ShieldAlert,
  FileText,
  ArrowUpFromLine,
  Hammer,
  Plus,
  Circle,
  Grid3x3,
  Wrench,
  Check,
  type LucideIcon,
} from "lucide-react";
import {
  DEPARTMENTS,
  CHECKLISTS,
  checklistKey,
  type DepartmentValue,
} from "@/lib/departments";

export const Route = createFileRoute("/utbildning")({
  component: UtbildningPage,
});

type TabKey = "moduler" | "onboarding" | "checklistor";

function UtbildningPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabKey>("moduler");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  const action = (
    <button
      type="button"
      onClick={() => navigate({ to: "/spela-in" })}
      style={{
        background: "#0b1e2d",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      ⏺ Spela in ny modul
    </button>
  );

  return (
    <LightAppShell title="Utbildning & Onboarding" action={action}>
      <div>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", margin: 0 }}>
          Utbildning & Onboarding
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          Byggelement AB · Ucklum · AI-driven utbildning
        </p>
      </div>

      <StatsRow />

      <Tabs tab={tab} setTab={setTab} />

      {tab === "moduler" && <ModulerTab />}
      {tab === "onboarding" && <OnboardingTab />}
      {tab === "checklistor" && <ChecklistTab />}
    </LightAppShell>
  );
}

/* ============= STATS ============= */

function StatsRow() {
  const cards = [
    { border: "#3b82f6", label: "AKTIVA MODULER", value: "5", sub: "totalt i systemet" },
    { border: "#10b981", label: "GODKÄNDA", value: "127", sub: "genomförda utbildningar" },
    { border: "#f59e0b", label: "PÅGÅR", value: "23", sub: "under upplärning" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderLeft: `4px solid ${c.border}`,
            borderRadius: 10,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, color: "#6b7280" }}>{c.label}</div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color: "#111827", lineHeight: 1.1, marginTop: 6 }}>
            {c.value}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ============= TABS ============= */

function Tabs({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  const items: { key: TabKey; label: string }[] = [
    { key: "moduler", label: "Moduler" },
    { key: "onboarding", label: "Onboarding-status" },
    { key: "checklistor", label: "Avdelningschecklistor" },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0 20px", display: "flex", gap: 4 }}>
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setTab(it.key)}
            style={{
              padding: "14px 20px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${active ? "#0b1e2d" : "transparent"}`,
              color: active ? "#111827" : "#6b7280",
              fontWeight: active ? 600 : 500,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============= TAB 1: MODULER ============= */

type ModuleCategory = "Betong & Prefab" | "Säkerhet" | "Maskiner" | "AI skapar";

type ModuleCard = {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  meta: string;
  progress: number;
  progressColor: string;
  category: ModuleCategory;
  animated?: boolean;
};

const MODULES: ModuleCard[] = [
  {
    id: "introduktion-betong",
    icon: Layers,
    iconBg: "#dbeafe",
    iconColor: "#1e40af",
    badge: "27/27 klara",
    badgeBg: "#d1fae5",
    badgeColor: "#065f46",
    title: "Introduktion betong",
    meta: "12 min · 5 steg · Quiz · Inspelad av Erik Svensson",
    progress: 100,
    progressColor: "#10b981",
    category: "Betong & Prefab",
  },
  {
    id: "sakerhet-skydd",
    icon: ShieldAlert,
    iconBg: "#fef3c7",
    iconColor: "#92400e",
    badge: "27/27 klara",
    badgeBg: "#d1fae5",
    badgeColor: "#065f46",
    title: "Säkerhet & skydd",
    meta: "8 min · 4 steg · Certifiering · Inspelad av Anna Berg",
    progress: 100,
    progressColor: "#10b981",
    category: "Säkerhet",
  },
  {
    id: "ritningslasning",
    icon: FileText,
    iconBg: "#ede9fe",
    iconColor: "#6d28d9",
    badge: "19/27 klara",
    badgeBg: "#fef3c7",
    badgeColor: "#92400e",
    title: "Ritningsläsning",
    meta: "20 min · 8 steg · Quiz · Inspelad av Erik Svensson",
    progress: 70,
    progressColor: "#f59e0b",
    category: "Betong & Prefab",
  },
  {
    id: "traverskorning",
    icon: ArrowUpFromLine,
    iconBg: "#f3f4f6",
    iconColor: "#6b7280",
    badge: "AI skapar...",
    badgeBg: "#fef3c7",
    badgeColor: "#92400e",
    title: "Traverskörning",
    meta: "AI bearbetar video... Inspelad av Erik Svensson",
    progress: 60,
    progressColor: "#f59e0b",
    category: "AI skapar",
    animated: true,
  },
  {
    id: "gjutning-armering",
    icon: Hammer,
    iconBg: "#fce7f3",
    iconColor: "#9d174d",
    badge: "12/27 klara",
    badgeBg: "#f3f4f6",
    badgeColor: "#374151",
    title: "Gjutning & armering",
    meta: "25 min · 10 steg · Certifiering · Inspelad av Erik Svensson",
    progress: 44,
    progressColor: "#9ca3af",
    category: "Betong & Prefab",
  },
];

const FILTERS: ("Alla" | ModuleCategory)[] = [
  "Alla",
  "Betong & Prefab",
  "Säkerhet",
  "Maskiner",
  "AI skapar",
];

function ModulerTab() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alla");

  const filtered = useMemo(
    () => (filter === "Alla" ? MODULES : MODULES.filter((m) => m.category === filter)),
    [filter],
  );

  return (
    <div>
      <style>{`
        @keyframes wr-pulse { 0%,100%{opacity:1}50%{opacity:.5} }
        @keyframes wr-stripes { from{background-position:0 0} to{background-position:24px 0} }
        .wr-mod-card:hover { border-color:#0b1e2d !important; transform:translateY(-2px); transition: all .15s ease; }
      `}</style>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "#0b1e2d" : "#e5e7eb"}`,
                background: active ? "#0b1e2d" : "#fff",
                color: active ? "#fff" : "#374151",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((m) => (
          <ModuleCardView key={m.id} mod={m} onClick={() => navigate({ to: `/modul/${m.id}` as never })} />
        ))}

        <button
          type="button"
          onClick={() => navigate({ to: "/spela-in" })}
          style={{
            background: "#fff",
            border: "2px dashed #d1d5db",
            borderRadius: 10,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            minHeight: 220,
          }}
        >
          <Plus size={32} color="#9ca3af" />
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#374151", marginTop: 10 }}>
            Spela in ny modul
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            AI bygger utbildningen automatiskt
          </div>
          <span
            style={{
              background: "#0b1e2d",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 20px",
              marginTop: 12,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + Spela in
          </span>
        </button>
      </div>
    </div>
  );
}

function ModuleCardView({ mod, onClick }: { mod: ModuleCard; onClick: () => void }) {
  const Icon = mod.icon;
  const progressBarStyle: CSSProperties = mod.animated
    ? {
        height: "100%",
        width: `${mod.progress}%`,
        background:
          "repeating-linear-gradient(45deg, #f59e0b, #f59e0b 8px, #fbbf24 8px, #fbbf24 16px)",
        animation: "wr-stripes 1s linear infinite",
      }
    : {
        height: "100%",
        width: `${mod.progress}%`,
        background: mod.progressColor,
      };

  return (
    <div
      className="wr-mod-card"
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: mod.iconBg,
            color: mod.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} />
        </div>
        <span
          style={{
            background: mod.badgeBg,
            color: mod.badgeColor,
            fontSize: 11,
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 999,
            animation: mod.animated ? "wr-pulse 1.5s ease-in-out infinite" : undefined,
          }}
        >
          {mod.badge}
        </span>
      </div>

      <div>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#111827" }}>
          {mod.title}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{mod.meta}</div>
      </div>

      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
        <div style={progressBarStyle} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#374151",
            background: "#f3f4f6",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {mod.category}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toast("Redigera modul");
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "#6b7280",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Redigera
        </button>
      </div>
    </div>
  );
}

/* ============= TAB 2: ONBOARDING ============= */

type OnboardingRow = {
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  dept: string;
  start: string;
  done: string;
  doneTone: "red" | "amber" | "green";
  sms: "Ja" | "Nej";
  status: "Ej påbörjat" | "Pågår" | "Klar";
  action: "Skicka SMS" | "Påminn" | "Visa";
};

const ROWS: OnboardingRow[] = [
  {
    initials: "SB",
    avatarBg: "#ef4444",
    name: "Sara Berg",
    role: "Betongarbetare",
    dept: "Gjutavdelningen",
    start: "Måndag 19 maj",
    done: "0 av 3",
    doneTone: "red",
    sms: "Nej",
    status: "Ej påbörjat",
    action: "Skicka SMS",
  },
  {
    initials: "PL",
    avatarBg: "#f59e0b",
    name: "Petter Lindgren",
    role: "Truckförare",
    dept: "Lager",
    start: "Tisdag 20 maj",
    done: "2 av 3",
    doneTone: "amber",
    sms: "Ja",
    status: "Pågår",
    action: "Påminn",
  },
  {
    initials: "JN",
    avatarBg: "#3b82f6",
    name: "Johan Nilsson",
    role: "Montör",
    dept: "Montering",
    start: "Onsdag 21 maj",
    done: "1 av 3",
    doneTone: "amber",
    sms: "Ja",
    status: "Pågår",
    action: "Påminn",
  },
  {
    initials: "AJ",
    avatarBg: "#10b981",
    name: "Anders Johansson",
    role: "Gjutare",
    dept: "Gjutavdelningen",
    start: "2024-11-01",
    done: "3 av 3",
    doneTone: "green",
    sms: "Ja",
    status: "Klar",
    action: "Visa",
  },
];

function toneStyle(tone: "red" | "amber" | "green") {
  if (tone === "red") return { bg: "#fee2e2", color: "#991b1b" };
  if (tone === "amber") return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#d1fae5", color: "#065f46" };
}

function OnboardingTab() {
  const navigate = useNavigate();
  const [deptFilter, setDeptFilter] = useState("Alla avdelningar");
  const depts = useMemo(
    () => ["Alla avdelningar", ...Array.from(new Set(ROWS.map((r) => r.dept)))],
    [],
  );
  const rows = ROWS.filter((r) => deptFilter === "Alla avdelningar" || r.dept === deptFilter);

  const handleAction = (r: OnboardingRow) => {
    if (r.action === "Skicka SMS") toast.success(`SMS skickat till ${r.name}!`);
    else if (r.action === "Påminn") toast.success("Påminnelse skickad!");
    else navigate({ to: "/arbetskraft" });
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#111827", margin: 0 }}>
          Onboarding-status per medarbetare
        </h3>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          {depts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", fontSize: 11, color: "#6b7280", letterSpacing: 0.5 }}>
            {["MEDARBETARE", "AVDELNING", "STARTDATUM", "MODULER KLARA", "SMS SKICKAT", "STATUS", "ÅTGÄRD"].map((h) => (
              <th key={h} style={{ padding: "10px 8px", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const doneT = toneStyle(r.doneTone);
            const smsT = toneStyle(r.sms === "Ja" ? "green" : "red");
            const statusT = toneStyle(r.status === "Klar" ? "green" : r.status === "Pågår" ? "amber" : "red");
            return (
              <tr key={r.name} style={{ fontSize: 13, color: "#374151" }}>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: r.avatarBg, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{r.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.dept}</td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>{r.start}</td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ color: doneT.color, fontWeight: 600 }}>{r.done}</span>
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <Badge bg={smsT.bg} color={smsT.color}>{r.sms}</Badge>
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <Badge bg={statusT.bg} color={statusT.color}>{r.status}</Badge>
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #f3f4f6" }}>
                  <button
                    onClick={() => handleAction(r)}
                    style={{
                      background: r.action === "Skicka SMS" ? "#0b1e2d" : "transparent",
                      color: r.action === "Skicka SMS" ? "#fff" : "#374151",
                      border: r.action === "Skicka SMS" ? "none" : "1px solid #e5e7eb",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {r.action}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
      {children}
    </span>
  );
}

/* ============= TAB 3: CHECKLISTS ============= */

const DEPT_ICON_OVERRIDES: Record<DepartmentValue, { Icon: LucideIcon; color: string }> = {
  "snickeri": { Icon: Hammer, color: "#374151" },
  "gul-hallen": { Icon: Circle, color: "#f59e0b" },
  "rosa-hallen": { Icon: Circle, color: "#ec4899" },
  "grona-hallen": { Icon: Circle, color: "#10b981" },
  "armering": { Icon: Grid3x3, color: "#3b82f6" },
  "lap-och-lag": { Icon: Wrench, color: "#ef4444" },
};

function ChecklistTab() {
  const [selected, setSelected] = useState<DepartmentValue>("snickeri");
  const weeks = CHECKLISTS[selected];
  const flat = useMemo(
    () =>
      weeks.flatMap((w, wi) =>
        w.items.map((it, ii) => ({
          weekLabel: `VK ${wi + 1}`,
          title: it.title,
          desc: it.desc,
          idx: weeks.slice(0, wi).reduce((a, x) => a + x.items.length, 0) + ii,
        })),
      ),
    [weeks],
  );

  const [checks, setChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next: Record<number, boolean> = {};
    flat.forEach((it) => {
      next[it.idx] = localStorage.getItem(checklistKey(selected, it.idx)) === "1";
    });
    setChecks(next);
  }, [selected, flat]);

  const toggle = (idx: number) => {
    setChecks((prev) => {
      const v = !prev[idx];
      localStorage.setItem(checklistKey(selected, idx), v ? "1" : "0");
      return { ...prev, [idx]: v };
    });
  };

  const total = flat.length;
  const done = flat.filter((it) => checks[it.idx]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const fillColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const selectedDept = DEPARTMENTS.find((d) => d.value === selected)!;

  return (
    <>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 12 }}>
          Välj avdelning:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {DEPARTMENTS.map((d) => {
            const override = DEPT_ICON_OVERRIDES[d.value];
            const Icon = override.Icon;
            const active = selected === d.value;
            return (
              <button
                key={d.value}
                onClick={() => setSelected(d.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: 14,
                  border: active ? "2px solid #0b1e2d" : "1px solid #e5e7eb",
                  background: active ? "#f9fafb" : "#fff",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Icon size={20} color={override.color} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>{d.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#111827", margin: 0 }}>
            {selectedDept.name}
          </h3>
          <Badge bg="#f3f4f6" color="#374151">{done} av {total} uppgifter</Badge>
        </div>

        <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: fillColor, transition: "width .2s" }} />
        </div>

        <div>
          {flat.map((it) => {
            const checked = !!checks[it.idx];
            return (
              <div
                key={it.idx}
                onClick={() => toggle(it.idx)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid #f9fafb",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: checked ? "1.5px solid #0b1e2d" : "1.5px solid #d1d5db",
                    background: checked ? "#0b1e2d" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {checked && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    background: "#f3f4f6",
                    color: "#374151",
                    borderRadius: 3,
                    padding: "2px 6px",
                    flexShrink: 0,
                  }}
                >
                  {it.weekLabel}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: checked ? "#9ca3af" : "#111827",
                      textDecoration: checked ? "line-through" : "none",
                    }}
                  >
                    {it.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{it.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
