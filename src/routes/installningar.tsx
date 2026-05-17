import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { InviteUserModal } from "@/components/InviteUserModal";
import { toast } from "sonner";
import {
  Settings,
  Building2,
  Palette,
  Bell,
  Users,
  Plug,
  CreditCard,
  CheckCircle,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/installningar")({
  component: InstallningarPage,
});

const BRAND_COLORS = ["#7dedb8", "#60b0f4", "#a78bfa", "#ff6b35", "#ffd166", "#00e096"];

function InstallningarPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [primary, setPrimary] = useState("#7dedb8");
  const [warnDays, setWarnDays] = useState<7 | 30 | 90>(30);
  const [toggles, setToggles] = useState({ sms: true, email: true, cert: true });

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

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 ml-[260px] flex flex-col">
        <main className="px-8 py-7 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Settings size={24} strokeWidth={1.75} color="#7dedb8" />
              <h1 className="font-display font-bold text-[24px] text-white">Inställningar</h1>
            </div>
            <p className="text-[13px]" style={{ color: "#6a9ab0" }}>
              Hantera företagsprofil, användare och systemkonfiguration
            </p>
          </div>

          <div className="grid grid-cols-[3fr_2fr] gap-6">
            {/* LEFT */}
            <div className="flex flex-col">
              <CompanyCard />
              <BrandCard primary={primary} setPrimary={setPrimary} />
              <NotificationsCard
                toggles={toggles}
                setToggles={setToggles}
                warnDays={warnDays}
                setWarnDays={setWarnDays}
              />
              <UsersCard />
            </div>

            {/* RIGHT */}
            <div className="flex flex-col">
              <IntegrationsCard />
              <SubscriptionCard />
              <DangerCard />
            </div>
          </div>
        </main>
      </div>
      <style>{`
        ${sidebarKeyframes}
        .ins-input{background:#060f18;border:1px solid #1a3d58;border-radius:6px;padding:10px 14px;color:#fff;font-size:13px;width:100%;outline:none;transition:border-color .15s}
        .ins-input:focus{border-color:#7dedb8}
        .ins-label{font-family:'Space Mono',ui-monospace,monospace;font-size:9px;color:#6a9ab0;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px;display:block}
        .ins-card{background:#0e2538;border:1px solid #1a3d58;border-radius:10px;overflow:hidden;margin-bottom:16px}
        .ins-head{padding:16px 20px;border-bottom:1px solid #1a3d58;display:flex;align-items:center;justify-content:space-between}
        .ins-head-title{display:flex;align-items:center;gap:8px;font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#fff}
        .ins-mint-btn{background:#7dedb8;color:#060f18;font-weight:700;font-size:12px;padding:6px 14px;border-radius:6px;border:0;cursor:pointer}
        .ins-ghost-btn{background:transparent;color:#fff;border:1px solid #1a3d58;border-radius:6px;padding:8px 14px;font-size:12px;cursor:pointer;transition:border-color .15s}
        .ins-ghost-btn:hover{border-color:#7dedb8}
        .pill{padding:6px 12px;border-radius:999px;font-size:11px;border:1px solid #1a3d58;background:transparent;color:#6a9ab0;cursor:pointer;font-family:'Space Mono',ui-monospace,monospace}
        .pill.active{background:rgba(125,237,184,0.1);color:#7dedb8;border-color:rgba(125,237,184,0.3)}
        .toggle{width:36px;height:20px;border-radius:10px;position:relative;cursor:pointer;transition:background .15s;flex-shrink:0}
        .toggle.on{background:#7dedb8}
        .toggle.off{background:#1a3d58}
        .toggle-knob{position:absolute;top:2px;width:16px;height:16px;border-radius:50%;background:#060f18;transition:left .15s}
        .toggle.on .toggle-knob{left:18px}
        .toggle.off .toggle-knob{left:2px}
      `}</style>
    </div>
  );
}

/* ============== CARDS ============== */

function CompanyCard() {
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <Building2 size={16} strokeWidth={1.75} color="#7dedb8" /> Företagsprofil
        </div>
        <button onClick={() => toast.success("Inställningar sparade!")} className="ins-mint-btn">Spara</button>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <Field label="Företagsnamn" defaultValue="Byggelement AB" />
        <Field label="Organisationsnummer" defaultValue="556034-2148" />
        <Field label="E-post" defaultValue="info@byggelement.se" />
        <Field label="Telefon" defaultValue="010-000 00 00" />
        <div className="col-span-2">
          <Field label="Adress" defaultValue="Ucklum, Sverige" />
        </div>
        <div className="col-span-2">
          <span className="ins-label">Bransch</span>
          <select className="ins-input" defaultValue="Betong & Prefab">
            <option>Betong & Prefab</option>
            <option>Bygg & Anläggning</option>
            <option>Industri</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <span className="ins-label">{label}</span>
      <input className="ins-input" defaultValue={defaultValue} />
    </div>
  );
}

function BrandCard({ primary, setPrimary }: { primary: string; setPrimary: (c: string) => void }) {
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <Palette size={16} strokeWidth={1.75} color="#7dedb8" /> Varumärke & Design
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center font-display font-bold text-2xl"
            style={{ background: "#060f18", border: "1px solid #1a3d58", color: "#7dedb8" }}
          >
            BE
          </div>
          <div className="flex flex-col gap-1">
            <button className="ins-ghost-btn self-start">Byt logotyp</button>
            <span className="text-[11px]" style={{ color: "#6a9ab0" }}>
              Ladda upp PNG eller SVG · max 2MB
            </span>
          </div>
        </div>

        <span className="ins-label">Primärfärg</span>
        <div className="flex gap-2 mb-5">
          {BRAND_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setPrimary(c)}
              className="w-7 h-7 rounded-full cursor-pointer transition"
              style={{
                background: c,
                boxShadow: primary === c ? "0 0 0 2px #fff" : "none",
              }}
              aria-label={c}
            />
          ))}
        </div>

        <span className="ins-label">Förhandsvisning</span>
        <div
          className="rounded-md flex flex-col gap-1.5"
          style={{ height: 80, background: "#0b1e2d", border: "1px solid #1a3d58", padding: 10 }}
        >
          {["Dashboard", "Personal", "Moduler"].map((n) => (
            <div key={n} className="flex items-center gap-2 text-[11px] text-white/80">
              <span className="w-1 h-3 rounded-sm" style={{ background: primary }} />
              <span style={{ color: primary }}>●</span>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsCard({
  toggles,
  setToggles,
  warnDays,
  setWarnDays,
}: {
  toggles: { sms: boolean; email: boolean; cert: boolean };
  setToggles: (t: { sms: boolean; email: boolean; cert: boolean }) => void;
  warnDays: 7 | 30 | 90;
  setWarnDays: (d: 7 | 30 | 90) => void;
}) {
  const rows: { key: keyof typeof toggles; title: string; sub: string }[] = [
    { key: "sms", title: "SMS-påminnelser", sub: "Skicka SMS till personal vid nya moduler" },
    { key: "email", title: "E-postrapporter", sub: "Veckorapport till produktionschef varje fredag" },
    { key: "cert", title: "Certifikatvarningar", sub: "Notifiera när certifikat närmar sig utgång" },
  ];
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <Bell size={16} strokeWidth={1.75} color="#7dedb8" /> Notifikationer
        </div>
      </div>
      <div>
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between"
            style={{ padding: "14px 20px", borderBottom: "1px solid #1a3d58" }}
          >
            <div>
              <div className="font-bold text-[13px] text-white">{r.title}</div>
              <div className="text-[11px]" style={{ color: "#6a9ab0" }}>{r.sub}</div>
            </div>
            <div
              className={`toggle ${toggles[r.key] ? "on" : "off"}`}
              onClick={() => setToggles({ ...toggles, [r.key]: !toggles[r.key] })}
            >
              <span className="toggle-knob" />
            </div>
          </div>
        ))}
        <div
          className="flex items-center justify-between"
          style={{ padding: "14px 20px" }}
        >
          <div>
            <div className="font-bold text-[13px] text-white">Varningsdagar</div>
            <div className="text-[11px]" style={{ color: "#6a9ab0" }}>
              Hur många dagar innan certifikat varnas
            </div>
          </div>
          <div className="flex gap-2">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                className={`pill ${warnDays === d ? "active" : ""}`}
                onClick={() => setWarnDays(d)}
              >
                {d} dagar
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type UserRow = {
  initials: string;
  name: string;
  email: string;
  badge: string;
  bg: string;
  fg: string;
  avatarBg: string;
  avatarFg: string;
  border: string;
};

function UsersCard() {
  const users: UserRow[] = [
    {
      initials: "LS",
      name: "Lars Svensson",
      email: "lars@byggelement.se",
      badge: "Admin",
      bg: "rgba(125,237,184,0.1)",
      fg: "#7dedb8",
      border: "rgba(125,237,184,0.2)",
      avatarBg: "rgba(125,237,184,0.12)",
      avatarFg: "#7dedb8",
    },
    {
      initials: "ES",
      name: "Erik Svensson",
      email: "erik@byggelement.se",
      badge: "Teamledare",
      bg: "rgba(0,224,150,0.1)",
      fg: "#00e096",
      border: "rgba(0,224,150,0.2)",
      avatarBg: "rgba(0,224,150,0.12)",
      avatarFg: "#00e096",
    },
    {
      initials: "AB",
      name: "Anna Berg",
      email: "anna@byggelement.se",
      badge: "Chef",
      bg: "rgba(96,176,244,0.1)",
      fg: "#60b0f4",
      border: "rgba(96,176,244,0.2)",
      avatarBg: "rgba(96,176,244,0.12)",
      avatarFg: "#60b0f4",
    },
    {
      initials: "P2",
      name: "Partner2Work AB",
      email: "Bemanningspartner",
      badge: "Partner",
      bg: "rgba(125,237,184,0.08)",
      fg: "#7dedb8",
      border: "rgba(125,237,184,0.2)",
      avatarBg: "#7dedb8",
      avatarFg: "#060f18",
    },
  ];
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <Users size={16} strokeWidth={1.75} color="#7dedb8" /> Användare & Åtkomst
        </div>
        <button className="ins-mint-btn">+ Bjud in</button>
      </div>
      <div>
        {users.map((u, i) => (
          <div
            key={u.initials}
            className="flex items-center gap-3"
            style={{
              padding: "12px 20px",
              borderBottom: i === users.length - 1 ? "none" : "1px solid #1a3d58",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: u.avatarBg, color: u.avatarFg }}
            >
              {u.initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[13px] text-white">{u.name}</div>
              <div className="text-[11px]" style={{ color: "#6a9ab0" }}>{u.email}</div>
            </div>
            <span
              className="ml-auto"
              style={{
                background: u.bg,
                color: u.fg,
                border: `1px solid ${u.border}`,
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 10,
                fontFamily: "'Space Mono', ui-monospace, monospace",
                letterSpacing: ".05em",
              }}
            >
              {u.badge}
            </span>
            <MoreHorizontal size={16} strokeWidth={1.75} color="#6a9ab0" className="cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsCard() {
  const rows = [
    {
      icon: "AI",
      iconBg: "rgba(0,224,150,0.1)",
      iconColor: "#00e096",
      iconSize: 14,
      name: "OpenAI",
      sub: "AI-transkribering och quizgenerering",
      connected: true,
    },
    {
      icon: "SMS",
      iconBg: "rgba(96,176,244,0.1)",
      iconColor: "#60b0f4",
      iconSize: 12,
      name: "Twilio",
      sub: "SMS-utskick till personal",
      connected: true,
    },
  ];
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <Plug size={16} strokeWidth={1.75} color="#7dedb8" /> Integrationer
        </div>
      </div>
      <div>
        {rows.map((r, i) => (
          <div
            key={r.name}
            className="flex items-center gap-3.5"
            style={{
              padding: "16px 20px",
              borderBottom: i === rows.length - 1 ? "none" : "1px solid #1a3d58",
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold"
              style={{ background: r.iconBg, color: r.iconColor, fontSize: r.iconSize }}
            >
              {r.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-[14px] text-white">{r.name}</div>
              <div className="text-[11px]" style={{ color: "#6a9ab0" }}>{r.sub}</div>
            </div>
            {r.connected ? (
              <div className="flex items-center gap-2">
                <span
                  style={{
                    background: "rgba(0,224,150,0.1)",
                    color: "#00e096",
                    border: "1px solid rgba(0,224,150,0.2)",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontFamily: "'Space Mono', ui-monospace, monospace",
                  }}
                >
                  Ansluten
                </span>
                <CheckCircle size={14} strokeWidth={1.75} color="#00e096" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  style={{
                    background: "rgba(255,77,106,0.1)",
                    color: "#ff4d6a",
                    border: "1px solid rgba(255,77,106,0.2)",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontFamily: "'Space Mono', ui-monospace, monospace",
                  }}
                >
                  Ej ansluten
                </span>
                <button
                  style={{ color: "#7dedb8", fontSize: 12, background: "transparent", border: 0, cursor: "pointer" }}
                >
                  Anslut →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionCard() {
  return (
    <div className="ins-card">
      <div className="ins-head">
        <div className="ins-head-title">
          <CreditCard size={16} strokeWidth={1.75} color="#7dedb8" /> Prenumeration
        </div>
      </div>
      <div className="p-5">
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1a3d58" }}
        >
          <div>
            <div className="font-display font-bold text-[16px] text-white">Business Plan</div>
            <div className="text-[11px]" style={{ color: "#6a9ab0" }}>Faktureras månadsvis</div>
          </div>
          <div className="font-display font-bold text-[24px]" style={{ color: "#7dedb8" }}>
            999 kr/mån
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Aktiva användare" value="4 / 10" size={16} />
          <Stat label="Moduler" value="5 / obegränsat" size={16} />
          <Stat label="Nästa faktura" value="2026-06-16" size={14} mono />
          <Stat label="Medlem sedan" value="2024-11-01" size={14} mono />
        </div>
        
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  size,
  mono = false,
}: {
  label: string;
  value: string;
  size: number;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          color: "#6a9ab0",
          fontSize: 10,
          fontFamily: "'Space Mono', ui-monospace, monospace",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className="font-bold text-white"
        style={{
          fontSize: size,
          fontFamily: mono ? "'Space Mono', ui-monospace, monospace" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DangerCard() {
  return (
    <div
      style={{
        background: "rgba(255,77,106,0.04)",
        border: "1px solid rgba(255,77,106,0.15)",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <div className="font-display font-bold text-[14px] mb-3 flex items-center gap-2" style={{ color: "#ff4d6a" }}>
        <AlertTriangle size={16} strokeWidth={1.75} /> Farlig zon
      </div>
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,77,106,0.1)" }}
      >
        <span className="text-[13px]" style={{ color: "#6a9ab0" }}>Exportera all data</span>
        <button className="ins-ghost-btn">Exportera</button>
      </div>
      <div className="flex items-center justify-between" style={{ padding: "12px 0" }}>
        <span className="text-[13px]" style={{ color: "#6a9ab0" }}>Radera företagskonto</span>
        <button
          style={{
            background: "rgba(255,77,106,0.1)",
            color: "#ff4d6a",
            border: "1px solid rgba(255,77,106,0.2)",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Radera
        </button>
      </div>
    </div>
  );
}
