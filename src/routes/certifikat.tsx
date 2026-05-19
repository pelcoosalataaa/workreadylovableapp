import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/certifikat")({
  component: CertifikatPage,
});

type Tone = "green" | "amber" | "red" | "blue";
type Status = "valid" | "expiring" | "missing";

type Cert = {
  id: string;
  initials: string;
  avatar: Tone;
  name: string;
  role: string;
  cert: string;
  issued: string;
  expires: string;
  status: Status;
  expireDays?: number;
};

const AVATAR: Record<Tone, { bg: string; color: string }> = {
  green: { bg: "#d1fae5", color: "#065f46" },
  amber: { bg: "#fef3c7", color: "#92400e" },
  red: { bg: "#fee2e2", color: "#991b1b" },
  blue: { bg: "#dbeafe", color: "#1e40af" },
};

const INITIAL: Cert[] = [
  { id: "1", initials: "AJ", avatar: "green", name: "Anders Johansson", role: "Gjutare", cert: "Betongkurs", issued: "2024-11-05", expires: "2026-11-05", status: "valid" },
  { id: "2", initials: "AJ", avatar: "green", name: "Anders Johansson", role: "Gjutare", cert: "Säkerhet & Skydd", issued: "2024-11-05", expires: "2026-11-05", status: "valid" },
  { id: "3", initials: "EH", avatar: "amber", name: "Erik Holm", role: "Armerare", cert: "Traverskort", issued: "2024-05-30", expires: "2026-05-30", status: "expiring", expireDays: 14 },
  { id: "4", initials: "KL", avatar: "green", name: "Karl Lindgren", role: "Armerare", cert: "Svetsarlicens", issued: "2024-10-01", expires: "2027-10-01", status: "valid" },
  { id: "5", initials: "KL", avatar: "green", name: "Karl Lindgren", role: "Armerare", cert: "Betongkurs", issued: "2024-10-01", expires: "2027-10-01", status: "valid" },
  { id: "6", initials: "SB", avatar: "red", name: "Sara Berg", role: "Betongarbetare", cert: "Betongkurs", issued: "—", expires: "—", status: "missing" },
  { id: "7", initials: "LB", avatar: "red", name: "Lisa Bergström", role: "Formbyggare", cert: "Betongkurs", issued: "—", expires: "—", status: "missing" },
  { id: "8", initials: "MA", avatar: "red", name: "Mohammed Al-Hassan", role: "Betongarbetare", cert: "Betongkurs", issued: "—", expires: "—", status: "missing" },
];

const STAT_DEFS = [
  { key: "total", label: "TOTALT", sub: "certifikat i systemet", color: "#3b82f6" },
  { key: "giltig", label: "GILTIGA", sub: "inga åtgärder behövs", color: "#10b981" },
  { key: "utgaar_snart", label: "UTGÅR SNART", sub: "inom 30 dagar", color: "#f59e0b" },
  { key: "saknas", label: "SAKNAS", sub: "kräver omedelbar åtgärd", color: "#ef4444" },
] as const;

const FILTERS = ["Alla", "Giltiga", "Utgår snart", "Saknas"] as const;
type Filter = typeof FILTERS[number];

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", borderLeft: `4px solid ${color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color: "#111827", lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status, days }: { status: Status; days?: number }) {
  if (status === "valid") return <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Giltig</span>;
  if (status === "expiring") return <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Utgår om {days} dagar</span>;
  return <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>Saknas</span>;
}

function CertifikatPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("Alla");
  const [autoReminders, setAutoReminders] = useState(true);
  const [renewOpen, setRenewOpen] = useState<Cert | null>(null);
  const [bookOpen, setBookOpen] = useState<Cert | null>(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewNote, setRenewNote] = useState("");
  const [bookType, setBookType] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookPlace, setBookPlace] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate({ to: "/login" }); });
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate({ to: "/login" }); else setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const visible = useMemo(() => INITIAL.filter((c) => {
    if (filter === "Alla") return true;
    if (filter === "Giltiga") return c.status === "valid";
    if (filter === "Utgår snart") return c.status === "expiring";
    return c.status === "missing";
  }), [filter]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  const expiring = INITIAL.filter((c) => c.status === "expiring");
  const missing = INITIAL.filter((c) => c.status === "missing");

  return (
    <LightAppShell
      title="Certifikat & Efterlevnad"
      action={<SecondaryBtn onClick={() => toast.success("Exporterar alla certifikat...")}>⬇ Exportera alla</SecondaryBtn>}
    >
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Alert banner */}
      {expiring.length > 0 && (
        <div id="alert" style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#f59e0b", animation: "pulse 1.6s infinite" }} />
          <span style={{ fontSize: 13, color: "#92400e" }}>
            <strong>{expiring.length} certifikat</strong> utgår inom 30 dagar — åtgärda innan det påverkar produktionen
          </span>
          <button onClick={() => { setFilter("Utgår snart"); document.getElementById("cert-list")?.scrollIntoView({ behavior: "smooth" }); }} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#92400e", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Visa alla →</button>
        </div>
      )}

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* LEFT */}
        <div id="cert-list" style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Alla certifikat</div>
            <div style={{ display: "flex", gap: 6 }}>
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    background: active ? "#0b1e2d" : "#fff",
                    color: active ? "#fff" : "#374151",
                    border: "1px solid #e5e7eb",
                    borderRadius: 999, padding: "6px 12px",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>{f}</button>
                );
              })}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["MEDARBETARE", "CERTIFIKAT", "UTFÄRDAT", "UTGÅR", "STATUS", "ÅTGÄRD"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: AVATAR[c.avatar].bg, color: AVATAR[c.avatar].color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{c.initials}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{c.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{c.cert}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{c.issued}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>{c.expires}</td>
                  <td style={{ padding: "12px 14px" }}><StatusBadge status={c.status} days={c.expireDays} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    {c.status === "expiring" && (
                      <button onClick={() => setRenewOpen(c)} style={{ background: "#0b1e2d", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Förnya</button>
                    )}
                    {c.status === "missing" && (
                      <button onClick={() => setBookOpen(c)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Boka kurs</button>
                    )}
                    {c.status === "valid" && <span style={{ color: "#9ca3af" }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>Sammanfattning</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Utgår inom 30 dagar</div>
            {expiring.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                <span style={{ color: "#374151" }}>{c.name} — {c.cert}</span>
                <span style={{ fontWeight: 700, color: (c.expireDays ?? 0) <= 14 ? "#ef4444" : "#f59e0b" }}>{c.expireDays} dagar</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "#f3f4f6", margin: "12px 0" }} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Saknas helt</div>
            {missing.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 13 }}>
                <span style={{ color: "#374151" }}>{c.name} — {c.cert}</span>
                <button onClick={() => setBookOpen(c)} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Åtgärda →</button>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "#f3f4f6", margin: "12px 0" }} />

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Automatiska påminnelser</div>
            {[
              "90 dagar — Informationsmeddelande",
              "30 dagar — Påminnelse med instruktioner",
              "7 dagar — Akut varning till chef",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f9fafb", fontSize: 12, color: "#374151" }}>
                <Check size={14} color="#10b981" strokeWidth={2.5} /> {t}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>Aktivera automatiska påminnelser</span>
              <button
                onClick={() => { setAutoReminders((v) => !v); toast.success(autoReminders ? "Påminnelser inaktiverade" : "Påminnelser aktiverade"); }}
                style={{
                  width: 40, height: 22, borderRadius: 999,
                  background: autoReminders ? "#0b1e2d" : "#d1d5db",
                  border: "none", position: "relative", cursor: "pointer",
                  transition: "background 0.2s",
                }}
                aria-pressed={autoReminders}
              >
                <span style={{ position: "absolute", top: 2, left: autoReminders ? 20 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left 0.2s" }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Renew modal */}
      <Dialog open={!!renewOpen} onOpenChange={(o) => !o && setRenewOpen(null)}>
        <DialogContent>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Förnya certifikat</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Nytt datum
              <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Anteckning
              <textarea value={renewNote} onChange={(e) => setRenewNote(e.target.value)} rows={3} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, resize: "vertical" }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <SecondaryBtn onClick={() => setRenewOpen(null)}>Avbryt</SecondaryBtn>
              <PrimaryBtn onClick={() => { toast.success("Förnyelse sparad!"); setRenewDate(""); setRenewNote(""); setRenewOpen(null); }}>Spara förnyelse</PrimaryBtn>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book course modal */}
      <Dialog open={!!bookOpen} onOpenChange={(o) => !o && setBookOpen(null)}>
        <DialogContent>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Boka certifieringskurs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Kurstyp
              <input type="text" value={bookType} onChange={(e) => setBookType(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Datum
              <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
            </label>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Plats
              <input type="text" value={bookPlace} onChange={(e) => setBookPlace(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <SecondaryBtn onClick={() => setBookOpen(null)}>Avbryt</SecondaryBtn>
              <PrimaryBtn onClick={() => { toast.success("Kurs bokad!"); setBookType(""); setBookDate(""); setBookPlace(""); setBookOpen(null); }}>Boka kurs</PrimaryBtn>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`@keyframes pulse {0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </LightAppShell>
  );
}
