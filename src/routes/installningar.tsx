import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import {
  Building2,
  Palette,
  Bell,
  Users,
  Plug,
  CreditCard,
  Check,
  MoreHorizontal,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DEPARTMENTS } from "@/lib/departments";

export const Route = createFileRoute("/installningar")({
  component: InstallningarPage,
});

/* ============ STYLES ============ */
const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 10,
  marginBottom: 16,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  overflow: "visible",
};
const CARD_HEAD: React.CSSProperties = {
  padding: "16px 20px",
  borderBottom: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const HEAD_TITLE: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  color: "#111827",
};
const LABEL: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#6b7280",
  marginBottom: 4,
  display: "block",
  fontWeight: 600,
};
const INPUT: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  padding: "9px 12px",
  fontSize: 13,
  color: "#111827",
  width: "100%",
  outline: "none",
  background: "#fff",
};
const MUTED: React.CSSProperties = { fontSize: 12, color: "#6b7280" };

function GhostSmall({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "transparent",
        border: "1px solid #e5e7eb",
        color: "#374151",
        borderRadius: 6,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...(props.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}

function PrimarySmall({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "#0b1e2d",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...(props.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, defaultValue, type = "text", colSpan }: { label: string; defaultValue?: string; type?: string; colSpan?: number }) {
  return (
    <div style={colSpan ? { gridColumn: `span ${colSpan}` } : undefined}>
      <label style={LABEL}>{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        style={INPUT}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#0b1e2d")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
      />
    </div>
  );
}

function InstallningarPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

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

  return (
    <LightAppShell
      title="Inställningar"
      action={<PrimaryBtn onClick={() => toast.success("Alla ändringar sparade!")}>Spara alla ändringar</PrimaryBtn>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        <div>
          <CompanyCard />
          <BrandCard />
          <NotificationsCard />
          <UsersCard />
        </div>
        <div>
          <IntegrationsCard />
          <SubscriptionCard />
          <DangerCard />
        </div>
      </div>
    </LightAppShell>
  );
}

/* ============ CARD 1 — COMPANY ============ */
function CompanyCard() {
  return (
    <section style={CARD}>
      <div style={{ ...CARD_HEAD, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={16} color="#6b7280" />
          <span style={HEAD_TITLE}>Företagsprofil</span>
        </div>
        <GhostSmall onClick={() => toast.success("Företagsprofil sparad!")}>Spara</GhostSmall>
      </div>
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Företagsnamn" defaultValue="Byggelement AB" />
        <Field label="Organisationsnummer" defaultValue="556034-2148" />
        <Field label="E-post" defaultValue="info@byggelement.se" />
        <Field label="Telefon" defaultValue="010-000 00 00" />
        <div style={{ gridColumn: "span 2" }}>
          <label style={LABEL}>Adress</label>
          <input defaultValue="Ucklum, Sverige" style={INPUT} onFocus={(e) => (e.currentTarget.style.borderColor = "#0b1e2d")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={LABEL}>Bransch</label>
          <select defaultValue="Betong & Prefab" style={INPUT}>
            <option>Betong & Prefab</option>
            <option>Verkstad & Industri</option>
            <option>Lager & Logistik</option>
            <option>Bygg & Anläggning</option>
          </select>
        </div>
      </div>
    </section>
  );
}

/* ============ CARD 2 — BRAND ============ */
type Hall = { id: string; dot: string; name: string };
const INITIAL_HALLS: Hall[] = [
  { id: "1", dot: "#10b981", name: "Snickeriavdelning / Formbyggnad" },
  { id: "2", dot: "#f59e0b", name: "Gul hallen" },
  { id: "3", dot: "#ec4899", name: "Rosa hallen" },
  { id: "4", dot: "#22c55e", name: "Gröna hallen" },
  { id: "5", dot: "#3b82f6", name: "Armeringsavdelning" },
  { id: "6", dot: "#ef4444", name: "Lap och Lag" },
];

function BrandCard() {
  const [halls, setHalls] = useState<Hall[]>(INITIAL_HALLS);
  const updateHall = (id: string, name: string) => setHalls((p) => p.map((h) => (h.id === id ? { ...h, name } : h)));
  const removeHall = (id: string) => setHalls((p) => p.filter((h) => h.id !== id));
  const addHall = () => setHalls((p) => [...p, { id: String(Date.now()), dot: "#9ca3af", name: "" }]);
  return (
    <section style={CARD}>
      <div style={{ ...CARD_HEAD, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Palette size={16} color="#6b7280" />
          <span style={HEAD_TITLE}>Varumärke & Anpassning</span>
        </div>
        <GhostSmall onClick={() => toast.success("Varumärke sparat!")}>Spara</GhostSmall>
      </div>
      <div style={{ padding: 20 }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, background: "#0b1e2d", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 24, color: "#7dedb8" }}>
            BE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <GhostSmall onClick={() => toast.success("Ladda upp logotyp")} style={{ alignSelf: "flex-start" }}>Byt logotyp</GhostSmall>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Ladda upp PNG eller SVG · max 2MB</span>
          </div>
        </div>

        {/* Halls */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Hallnamn & Avdelningar</div>
          {halls.map((h) => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: h.dot, flexShrink: 0 }} />
              <input
                value={h.name}
                onChange={(e) => updateHall(h.id, e.target.value)}
                style={{ ...INPUT, flex: 1 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#0b1e2d")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <button
                onClick={() => removeHall(h.id)}
                aria-label="Ta bort"
                style={{ background: "transparent", border: 0, cursor: "pointer", color: "#9ca3af", padding: 4 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={addHall}
            style={{ background: "transparent", border: 0, color: "#0b1e2d", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 0" }}
          >
            + Lägg till avdelning
          </button>
        </div>

        {/* System labels */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Systemetiketter</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Platsnamn" defaultValue="Ucklum" />
          <Field label="Kundnamn (visas i systemet)" defaultValue="Byggelement AB" />
        </div>
      </div>
    </section>
  );
}

/* ============ CARD 3 — NOTIFICATIONS ============ */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? "#0b1e2d" : "#e5e7eb",
        border: 0, padding: 0, position: "relative", cursor: "pointer", transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: 999, background: "#fff",
        transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function NotificationsCard() {
  const [t, setT] = useState({ sms: true, email: true, cert: true });
  const [warn, setWarn] = useState<7 | 30 | 90>(30);
  const rows = [
    { key: "sms" as const, title: "SMS-påminnelser", sub: "Skicka SMS till personal vid nya moduler" },
    { key: "email" as const, title: "E-postrapporter", sub: "Veckorapport till produktionschef varje fredag" },
    { key: "cert" as const, title: "Certifikatvarningar", sub: "Notifiera när certifikat närmar sig utgång" },
  ];
  return (
    <section style={CARD}>
      <div style={CARD_HEAD}>
        <Bell size={16} color="#6b7280" />
        <span style={HEAD_TITLE}>Notifikationer</span>
      </div>
      <div>
        {rows.map((r) => (
          <div key={r.key} style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{r.sub}</div>
            </div>
            <Toggle on={t[r.key]} onChange={() => setT({ ...t, [r.key]: !t[r.key] })} />
          </div>
        ))}
        <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Varningsdagar</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Hur många dagar innan certifikat varnas</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {([7, 30, 90] as const).map((d) => {
              const active = warn === d;
              return (
                <button
                  key={d}
                  onClick={() => setWarn(d)}
                  style={{
                    padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                    border: active ? "1px solid #0b1e2d" : "1px solid #e5e7eb",
                    background: active ? "#0b1e2d" : "#fff",
                    color: active ? "#fff" : "#374151",
                    cursor: "pointer",
                  }}
                >
                  {d} dagar
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ CARD 4 — USERS ============ */
type UserRow = {
  id: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  name: string;
  email: string;
  badge: string;
  badgeBg: string;
  badgeFg: string;
};

const INITIAL_USERS: UserRow[] = [
  { id: "u1", initials: "LS", avatarBg: "#d1fae5", avatarFg: "#065f46", name: "Lars Svensson", email: "lars@byggelement.se", badge: "Admin", badgeBg: "#dbeafe", badgeFg: "#1e40af" },
  { id: "u2", initials: "ES", avatarBg: "#d1fae5", avatarFg: "#065f46", name: "Erik Svensson", email: "erik@byggelement.se", badge: "Teamledare", badgeBg: "#fef3c7", badgeFg: "#92400e" },
  { id: "u3", initials: "AB", avatarBg: "#dbeafe", avatarFg: "#1e40af", name: "Anna Berg", email: "anna@byggelement.se", badge: "Chef", badgeBg: "#ede9fe", badgeFg: "#6d28d9" },
  { id: "u4", initials: "P2", avatarBg: "#0b1e2d", avatarFg: "#7dedb8", name: "Partner2Work AB", email: "Bemanningspartner", badge: "Partner", badgeBg: "#f3f4f6", badgeFg: "#374151" },
];

const DEPT_OPTIONS = ["Alla avdelningar", ...DEPARTMENTS.map((d) => d.name)];
const ROLE_OPTIONS = ["Admin", "Chef", "Teamledare", "Operatör", "Partner"];

function UsersCard() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL_USERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRow | null>(null);
  const [editDept, setEditDept] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [openMenu]);

  return (
    <>
      <section style={CARD}>
        <div style={{ ...CARD_HEAD, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} color="#6b7280" />
            <span style={HEAD_TITLE}>Användare & Åtkomst</span>
          </div>
          <PrimarySmall onClick={() => setInviteOpen(true)}>+ Bjud in</PrimarySmall>
        </div>
        <div>
          {users.map((u, i) => (
            <div key={u.id} style={{ padding: "14px 20px", borderBottom: i === users.length - 1 ? "none" : "1px solid #f9fafb", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: u.avatarBg, color: u.avatarFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                {u.initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{u.email}</div>
              </div>
              <span style={{ background: u.badgeBg, color: u.badgeFg, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{u.badge}</span>
              <div style={{ position: "relative" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === u.id ? null : u.id); }}
                  aria-label="Mer"
                  style={{ background: "transparent", border: 0, cursor: "pointer", padding: 4, color: "#6b7280" }}
                >
                  <MoreHorizontal size={16} />
                </button>
                {openMenu === u.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 4, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 30 }}>
                    <MenuItem onClick={() => { setEditRole(u); setOpenMenu(null); }}>Redigera roll</MenuItem>
                    <MenuItem onClick={() => { setEditDept(u); setOpenMenu(null); }}>Byt avdelning</MenuItem>
                    <div style={{ height: 1, background: "#f3f4f6", margin: "4px 0" }} />
                    <MenuItem danger onClick={() => { setConfirmDelete(u); setOpenMenu(null); }}>Ta bort användare</MenuItem>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(email) => { toast.success(`Inbjudan skickad till ${email}!`); setInviteOpen(false); }}
      />

      <EditRoleModal
        user={editRole}
        onClose={() => setEditRole(null)}
        onSave={(role) => { if (editRole) { setUsers((p) => p.map((x) => x.id === editRole.id ? { ...x, badge: role } : x)); toast.success(`Roll uppdaterad till ${role}`); } setEditRole(null); }}
      />

      <EditDeptModal
        user={editDept}
        onClose={() => setEditDept(null)}
        onSave={(dept) => { toast.success(`Avdelning ändrad till ${dept}`); setEditDept(null); }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Ta bort användare?"
        message={`Är du säker på att du vill ta bort ${confirmDelete?.name}?`}
        confirmLabel="Ta bort"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) { setUsers((p) => p.filter((x) => x.id !== confirmDelete.id)); toast.success(`${confirmDelete.name} borttagen`); } setConfirmDelete(null); }}
      />
    </>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "8px 12px", fontSize: 13, fontWeight: 500,
        background: "transparent", border: 0, borderRadius: 4, cursor: "pointer",
        color: danger ? "#dc2626" : "#374151",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

/* ============ CARD 5 — INTEGRATIONS ============ */
function IntegrationsCard() {
  return (
    <section style={CARD}>
      <div style={CARD_HEAD}>
        <Plug size={16} color="#6b7280" />
        <span style={HEAD_TITLE}>Integrationer</span>
      </div>
      <IntegrationRow icon="AI" iconBg="#d1fae5" iconFg="#065f46" iconSize={14} name="OpenAI" sub="AI-transkribering och quizgenerering" status="ok" />
      <IntegrationRow icon="SMS" iconBg="#dbeafe" iconFg="#1e40af" iconSize={12} name="Twilio" sub="SMS-utskick till personal" status="ok" />
      <IntegrationRow icon="PAY" iconBg="#f3f4f6" iconFg="#374151" iconSize={11} name="Stripe" sub="Betalning och prenumeration" status="off" last />
    </section>
  );
}

function IntegrationRow({ icon, iconBg, iconFg, iconSize, name, sub, status, last }: { icon: string; iconBg: string; iconFg: string; iconSize: number; name: string; sub: string; status: "ok" | "off"; last?: boolean }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: last ? "none" : "1px solid #f9fafb", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: iconBg, color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: iconSize, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{name}</div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>{sub}</div>
      </div>
      {status === "ok" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Check size={16} color="#10b981" />
          <span style={{ background: "#d1fae5", color: "#065f46", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Ansluten</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>Ej ansluten</span>
          <button onClick={() => toast.success("Öppnar Stripe-anslutning...")} style={{ background: "transparent", border: 0, color: "#0b1e2d", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Anslut →</button>
        </div>
      )}
    </div>
  );
}

/* ============ CARD 6 — SUBSCRIPTION ============ */
function SubscriptionCard() {
  const stats = [
    { label: "Aktiva användare", value: "4 / 10", mono: false },
    { label: "Moduler", value: "5 / Obegränsat", mono: false },
    { label: "Nästa faktura", value: "2026-06-16", mono: true },
    { label: "Medlem sedan", value: "2024-11-01", mono: true },
  ];
  return (
    <section style={CARD}>
      <div style={CARD_HEAD}>
        <CreditCard size={16} color="#6b7280" />
        <span style={HEAD_TITLE}>Prenumeration</span>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#111827" }}>Business Plan</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Faktureras månadsvis</div>
          </div>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#0b1e2d" }}>5 990 kr/mån</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#f9fafb", borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: s.value.length > 10 ? 14 : 16, color: "#111827", marginTop: 4, fontFamily: s.mono ? "ui-monospace, monospace" : undefined }}>{s.value}</div>
            </div>
          ))}
        </div>
        <SecondaryBtn style={{ width: "100%" }} onClick={() => toast.success("Öppnar planhantering...")}>Hantera prenumeration</SecondaryBtn>
      </div>
    </section>
  );
}

/* ============ CARD 7 — DANGER ============ */
function DangerCard() {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <>
      <section style={{ ...CARD, borderLeft: "4px solid #ef4444" }}>
        <div style={CARD_HEAD}>
          <AlertTriangle size={16} color="#dc2626" />
          <span style={{ ...HEAD_TITLE, color: "#dc2626" }}>Farlig zon</span>
        </div>
        <div>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#374151" }}>Exportera all data</span>
            <GhostSmall onClick={() => toast.success("Export påbörjad — du får ett e-postmeddelande när den är klar.")}>Exportera</GhostSmall>
          </div>
          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#374151" }}>Radera företagskonto</span>
            <button
              onClick={() => setConfirmDel(true)}
              style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Radera
            </button>
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={confirmDel}
        title="Radera företagskonto?"
        message="Är du säker? Detta kan inte ångras."
        confirmLabel="Radera permanent"
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => { toast.success("Begäran om radering registrerad."); setConfirmDel(false); }}
      />
    </>
  );
}

/* ============ MODALS ============ */
function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <DialogContent
      style={{ background: "#fff", maxWidth: 460, padding: 24, borderRadius: 12 }}
      className="!gap-0"
    >
      {children}
    </DialogContent>
  );
}

function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#111827", margin: "0 0 16px" }}>{children}</h3>;
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>{children}</div>;
}

function InviteModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [dept, setDept] = useState(DEPT_OPTIONS[0]);
  useEffect(() => { if (!open) { setName(""); setEmail(""); setRole(ROLE_OPTIONS[0]); setDept(DEPT_OPTIONS[0]); } }, [open]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalShell>
        <ModalTitle>Bjud in användare</ModalTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={LABEL}>Namn</label><input value={name} onChange={(e) => setName(e.target.value)} style={INPUT} /></div>
          <div><label style={LABEL}>E-post</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={INPUT} /></div>
          <div><label style={LABEL}>Roll</label><select value={role} onChange={(e) => setRole(e.target.value)} style={INPUT}>{ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><label style={LABEL}>Avdelning</label><select value={dept} onChange={(e) => setDept(e.target.value)} style={INPUT}>{DEPT_OPTIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <ModalFooter>
          <SecondaryBtn onClick={onClose}>Avbryt</SecondaryBtn>
          <PrimaryBtn onClick={() => { if (!email) { toast.error("E-post krävs"); return; } onSubmit(email); }}>Skicka inbjudan</PrimaryBtn>
        </ModalFooter>
      </ModalShell>
    </Dialog>
  );
}

function EditRoleModal({ user, onClose, onSave }: { user: UserRow | null; onClose: () => void; onSave: (role: string) => void }) {
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  useEffect(() => { if (user) setRole(user.badge); }, [user]);
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <ModalShell>
        <ModalTitle>Redigera roll</ModalTitle>
        <div><label style={LABEL}>Roll för {user?.name}</label><select value={role} onChange={(e) => setRole(e.target.value)} style={INPUT}>{ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <ModalFooter>
          <SecondaryBtn onClick={onClose}>Avbryt</SecondaryBtn>
          <PrimaryBtn onClick={() => onSave(role)}>Spara</PrimaryBtn>
        </ModalFooter>
      </ModalShell>
    </Dialog>
  );
}

function EditDeptModal({ user, onClose, onSave }: { user: UserRow | null; onClose: () => void; onSave: (dept: string) => void }) {
  const [dept, setDept] = useState(DEPT_OPTIONS[0]);
  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <ModalShell>
        <ModalTitle>Byt avdelning</ModalTitle>
        <div><label style={LABEL}>Avdelning för {user?.name}</label><select value={dept} onChange={(e) => setDept(e.target.value)} style={INPUT}>{DEPT_OPTIONS.map((d) => <option key={d}>{d}</option>)}</select></div>
        <ModalFooter>
          <SecondaryBtn onClick={onClose}>Avbryt</SecondaryBtn>
          <PrimaryBtn onClick={() => onSave(dept)}>Spara</PrimaryBtn>
        </ModalFooter>
      </ModalShell>
    </Dialog>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel, onCancel, onConfirm }: { open: boolean; title: string; message: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <ModalShell>
        <ModalTitle>{title}</ModalTitle>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{message}</p>
        <ModalFooter>
          <SecondaryBtn onClick={onCancel}>Avbryt</SecondaryBtn>
          <button
            onClick={onConfirm}
            style={{ background: "#dc2626", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {confirmLabel}
          </button>
        </ModalFooter>
      </ModalShell>
    </Dialog>
  );
}
