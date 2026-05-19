import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LightAppShell } from "@/components/LightAppShell";
import { PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import { Layers, Home, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/kompetensmatris")({
  component: KompetensmatrisPage,
});

type Cell = "ok" | "wip" | "none";
type Tone = "green" | "amber" | "red" | "blue";

const AVATAR: Record<Tone, { bg: string; color: string }> = {
  green: { bg: "#d1fae5", color: "#065f46" },
  amber: { bg: "#fef3c7", color: "#92400e" },
  red: { bg: "#fee2e2", color: "#991b1b" },
  blue: { bg: "#dbeafe", color: "#1e40af" },
};

type Row = {
  initials: string; avatar: Tone; name: string; role: string; shift: string;
  company: string; companyTone: "blue" | "amber";
  cells: Cell[];
  certs: { label: string; tone: "ok" | "bad" }[];
};

const DEPT_HEADERS = ["GJUTNING", "VIBRERING", "AVJÄMNING", "RITNINGSLÄSNING", "SÄKERHET"];

const ROWS: Row[] = [
  { initials: "AJ", avatar: "green", name: "Anders Johansson", role: "Gjutare", shift: "Dag", company: "Byggelement AB", companyTone: "blue",
    cells: ["ok", "ok", "ok", "ok", "ok"], certs: [{ label: "✓ Betongkurs", tone: "ok" }, { label: "✓ Traverskort", tone: "ok" }] },
  { initials: "SB", avatar: "red", name: "Sara Berg", role: "Betongarbetare", shift: "Dag", company: "Partner2Work", companyTone: "amber",
    cells: ["none", "none", "none", "none", "none"], certs: [{ label: "✗ Betongkurs saknas", tone: "bad" }] },
  { initials: "KL", avatar: "green", name: "Karl Lindgren", role: "Armerare", shift: "Dag", company: "Byggelement AB", companyTone: "blue",
    cells: ["ok", "ok", "ok", "ok", "ok"], certs: [{ label: "✓ Betongkurs", tone: "ok" }, { label: "✓ Svetsarlicens", tone: "ok" }] },
];

const DEPARTMENTS = [
  "Alla avdelningar", "Snickeriavdelning", "Gul hallen", "Rosa hallen",
  "Gröna hallen", "Armeringsavdelning", "Lap och Lag",
] as const;

const EMP_TYPES = ["Alla", "Egen personal", "Inhyrd personal"] as const;

function CellDot({ c }: { c: Cell }) {
  const style: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 999, display: "inline-flex",
    alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
    border: "1px solid",
  };
  if (c === "ok") return <span style={{ ...style, background: "#d1fae5", color: "#065f46", borderColor: "#a7f3d0" }}>✓</span>;
  if (c === "wip") return <span style={{ ...style, background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" }}>⏳</span>;
  return <span style={{ ...style, background: "#f3f4f6", color: "#9ca3af", borderColor: "#e5e7eb" }}>—</span>;
}

const STATS = [
  { label: "PERSONAL", value: "27", sub: "", color: "#3b82f6" },
  { label: "GODKÄNDA", value: "19", sub: "70%", color: "#10b981" },
  { label: "PÅGÅR", value: "5", sub: "", color: "#f59e0b" },
];

function KompetensmatrisPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [dept, setDept] = useState<string>("Alla avdelningar");
  const [emp, setEmp] = useState<string>("Alla");
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [newDept, setNewDept] = useState("");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!s) navigate({ to: "/login" }); });
    supabase.auth.getSession().then(({ data }) => { if (!data.session) navigate({ to: "/login" }); else setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const visible = useMemo(() => ROWS.filter((r) => {
    if (emp === "Egen personal" && r.company !== "Byggelement AB") return false;
    if (emp === "Inhyrd personal" && r.company === "Byggelement AB") return false;
    return r.name.toLowerCase().includes(q.toLowerCase());
  }), [emp, q]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  return (
    <LightAppShell
      title="Kompetensmatris"
      action={
        <div style={{ display: "flex", gap: 8 }}>
          <SecondaryBtn onClick={() => toast.success("Exporterar kompetensmatris...")}>⬇ Exportera</SecondaryBtn>
          <PrimaryBtn onClick={() => setAddOpen(true)}>+ Lägg till kompetens</PrimaryBtn>
        </div>
      }
    >
      {/* Filter card */}
      <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Avdelning
          <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, background: "#fff" }}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Anställningstyp
          <select value={emp} onChange={(e) => setEmp(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13, background: "#fff" }}>
            {EMP_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Sök
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sök person..." style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
        </label>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", borderLeft: `4px solid ${s.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color: "#111827", lineHeight: 1.1, marginTop: 6 }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Department header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: "#dbeafe", color: "#1e40af", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Layers size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#111827" }}>Betong & Prefab</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Byggelement AB · Thomas Betong · SF Marina</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 700 }}>
          <span style={{ color: "#3b82f6" }}>8 personal</span>
          <span style={{ color: "#10b981" }}>6 godkända</span>
          <span style={{ color: "#f59e0b" }}>2 pågår</span>
        </div>
      </div>

      {/* Department card */}
      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <button onClick={() => setCollapsed((c) => !c)} style={{ width: "100%", padding: "14px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer", textAlign: "left" }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Home size={16} color="#374151" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#111827" }}>Gjutavdelningen</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Gjutning · Vibrering · Avjämning</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>4 Godkända</span>
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>1 Pågår</span>
            <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>1 Ej start</span>
          </div>
          {collapsed ? <ChevronRight size={18} color="#6b7280" /> : <ChevronDown size={18} color="#6b7280" />}
        </button>

        {!collapsed && (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>PERSON</th>
                  {DEPT_HEADERS.map((h) => (
                    <th key={h} style={{ textAlign: "center", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                  <th style={{ textAlign: "left", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>CERTIFIKAT</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.initials} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: AVATAR[r.avatar].bg, color: AVATAR[r.avatar].color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{r.initials}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>{r.role} · {r.shift}</div>
                          <span style={{ display: "inline-block", marginTop: 2, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: r.companyTone === "blue" ? "#dbeafe" : "#fef3c7", color: r.companyTone === "blue" ? "#1e40af" : "#92400e" }}>{r.company}</span>
                        </div>
                      </div>
                    </td>
                    {r.cells.map((c, i) => (
                      <td key={i} style={{ padding: "12px 14px", textAlign: "center" }}><CellDot c={c} /></td>
                    ))}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {r.certs.map((cert, i) => (
                          <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: cert.tone === "ok" ? "#d1fae5" : "#fee2e2", color: cert.tone === "ok" ? "#065f46" : "#991b1b" }}>{cert.label}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#f9fafb" }}>
                  <td style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: 0.5 }}>TÄCKNINGSGRAD</td>
                  {["67%", "100%", "100%", "67%", "100%"].map((t, i) => (
                    <td key={i} style={{ padding: "10px 14px", textAlign: "center", fontSize: 11, fontWeight: 700, color: t === "100%" ? "#10b981" : "#f59e0b" }}>{t}</td>
                  ))}
                  <td style={{ padding: "10px 14px", textAlign: "center", color: "#9ca3af" }}>—</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", gap: 20, padding: "12px 16px", background: "#f9fafb", borderTop: "1px solid #e5e7eb", fontSize: 11, color: "#6b7280" }}>
              <span>✓ Godkänd</span>
              <span>⏳ Under upplärning</span>
              <span>— Saknas</span>
              <span style={{ marginLeft: "auto" }}>⚠ = Certifikat utgår snart</span>
            </div>
          </>
        )}
      </div>

      {/* Add department */}
      <button
        onClick={() => setAddDeptOpen(true)}
        className="add-dept"
        style={{
          width: "100%", border: "1px dashed #e5e7eb", borderRadius: 10, padding: 16,
          textAlign: "center", color: "#9ca3af", fontSize: 13, background: "transparent", cursor: "pointer",
          marginTop: 12,
        }}
      >+ Lägg till ny avdelning</button>
      <style>{`.add-dept:hover{border-color:#0b1e2d!important;color:#0b1e2d!important}`}</style>

      {/* Modals */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Lägg till kompetens</div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Kompetensnamn
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <SecondaryBtn onClick={() => setAddOpen(false)}>Avbryt</SecondaryBtn>
            <PrimaryBtn onClick={() => { toast.success("Kompetens tillagd!"); setNewSkill(""); setAddOpen(false); }}>Spara</PrimaryBtn>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addDeptOpen} onOpenChange={setAddDeptOpen}>
        <DialogContent>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Lägg till ny avdelning</div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Avdelningsnamn
            <input value={newDept} onChange={(e) => setNewDept(e.target.value)} style={{ width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 13 }} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <SecondaryBtn onClick={() => setAddDeptOpen(false)}>Avbryt</SecondaryBtn>
            <PrimaryBtn onClick={() => { toast.success("Avdelning tillagd!"); setNewDept(""); setAddDeptOpen(false); }}>Lägg till</PrimaryBtn>
          </div>
        </DialogContent>
      </Dialog>
    </LightAppShell>
  );
}
