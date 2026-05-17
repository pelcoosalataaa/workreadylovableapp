import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar, sidebarKeyframes } from "@/components/AppSidebar";
import { Building2, X } from "lucide-react";
import { ManageCompanyModal, type ManageCompanyData } from "@/components/ManageCompanyModal";

export const Route = createFileRoute("/bemanningsbolag")({
  component: BemanningsbolagPage,
});

const stats = [
  { label: "AKTIVA BOLAG", value: "1", color: "#60b0f4" },
  { label: "TOTALT UTHYRD", value: "8", color: "#7dedb8" },
  { label: "GODKÄNDA", value: "6", color: "#00e096" },
];

type Status = "Godkänd" | "Pågår" | "Ej start";

type Row = {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  dept: string;
  start: string;
  percent: number;
  barColor: string;
  status: Status;
};

const rows: Row[] = [
  { initials: "PL", avatarBg: "rgba(125,237,184,0.12)", avatarColor: "#7dedb8", name: "Petter Lindgren", role: "Truckförare · Kväll", dept: "Lager & Utskeppning", start: "2024-11-01", percent: 65, barColor: "#7dedb8", status: "Pågår" },
  { initials: "SB", avatarBg: "rgba(255,77,106,0.12)", avatarColor: "#ff4d6a", name: "Sara Berg", role: "Betongarbetare · Dag", dept: "Gjutavdelningen", start: "2024-11-12", percent: 0, barColor: "#ff4d6a", status: "Ej start" },
  { initials: "LN", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Lisa Nordin", role: "Armerare · Dag", dept: "Armeringsavdelningen", start: "2024-10-15", percent: 100, barColor: "#00e096", status: "Godkänd" },
  { initials: "TK", avatarBg: "rgba(0,224,150,0.12)", avatarColor: "#00e096", name: "Tommy Karlsson", role: "Truckförare · Dag", dept: "Lager & Utskeppning", start: "2024-09-01", percent: 100, barColor: "#00e096", status: "Godkänd" },
  { initials: "BM", avatarBg: "rgba(255,209,102,0.12)", avatarColor: "#ffd166", name: "Bo Magnusson", role: "Lagermedarbetare · Dag", dept: "Lager & Utskeppning", start: "2024-11-10", percent: 25, barColor: "#ffd166", status: "Pågår" },
];

function statusStyle(s: Status): React.CSSProperties {
  if (s === "Godkänd") return { background: "rgba(0,224,150,0.1)", color: "#00e096", border: "1px solid rgba(0,224,150,0.2)" };
  if (s === "Pågår") return { background: "rgba(255,209,102,0.1)", color: "#ffd166", border: "1px solid rgba(255,209,102,0.2)" };
  return { background: "rgba(255,77,106,0.1)", color: "#ff4d6a", border: "1px solid rgba(255,77,106,0.2)" };
}

type Company = { name: string; city: string; description: string; email: string; phone: string };

function BemanningsbolagPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [manageData, setManageData] = useState<ManageCompanyData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<Company>({ name: "", city: "", description: "", email: "", phone: "" });

  const openModal = () => { setForm({ name: "", city: "", description: "", email: "", phone: "" }); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCompanies((c) => [...c, { ...form, name: form.name.trim().slice(0, 100), city: form.city.trim().slice(0, 100), description: form.description.trim().slice(0, 200), email: form.email.trim().slice(0, 255), phone: form.phone.trim().slice(0, 50) }]);
    setModalOpen(false);
  };

  const initialsOf = (n: string) => n.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";

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
        <main className="px-8 py-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display font-bold text-[24px] text-white flex items-center gap-2">
                <Building2 size={22} strokeWidth={1.75} color="#7dedb8" /> Bemanningsbolag
              </h1>
              <p className="text-sm mt-1" style={{ color: "#6a9ab0" }}>Hantera era bemanningspartners och deras personal</p>
            </div>
            <button onClick={openModal} className="text-xs font-bold px-3 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>+ Lägg till bolag</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="relative overflow-hidden" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderTop: `2px solid ${s.color}`, borderRadius: 10, padding: 20 }}>
                <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 120, height: 120, background: `radial-gradient(circle at top right, ${s.color}22, transparent 70%)` }} />
                <div className="mono text-[9px] font-bold uppercase" style={{ color: "#6a9ab0" }}>{s.label}</div>
                <div className="font-display font-bold mt-2" style={{ fontSize: 46, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Partner2Work company card */}
          <div style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            {/* Card header */}
            <div className="flex items-center gap-4 flex-wrap" style={{ padding: "20px 24px", borderBottom: "1px solid #1a3d58" }}>
              <div className="flex items-center justify-center font-display font-bold text-[18px] shrink-0" style={{ width: 48, height: 48, borderRadius: 10, background: "#7dedb8", color: "#060f18" }}>P2</div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-white text-[18px]">Partner2Work AB</div>
                <div className="text-[12px]" style={{ color: "#6a9ab0" }}>Vänersborg · Bemanning & Rekrytering</div>
                <div className="mono text-[11px] mt-0.5" style={{ color: "#6a9ab0" }}>info@partner2work.se · 010-889 98 30</div>
              </div>
              <div className="flex items-center" style={{ gap: 24 }}>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#60b0f4", lineHeight: 1 }}>8</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Uthyrda</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#00e096", lineHeight: 1 }}>6</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Godkända</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold" style={{ fontSize: 28, color: "#ffd166", lineHeight: 1 }}>2</div>
                  <div className="text-[10px] mt-1" style={{ color: "#6a9ab0" }}>Pågår</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[11px] font-semibold px-3 py-1.5 rounded-md border" style={{ borderColor: "#1a3d58", color: "#edfaf4", background: "transparent" }}>Kontakta</button>
                <button onClick={() => setManageData({ name: "Partner2Work AB", city: "Vänersborg", email: "info@partner2work.se", phone: "010-889 98 30", uthyrda: 8, godkanda: 6, pagar: 2, personnel: rows.map((r) => ({ name: r.name, status: r.status })) })} className="text-[11px] font-bold px-3 py-1.5 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>Hantera</button>
              </div>
            </div>

            {/* Table */}
            <div>
              <div className="grid mono uppercase font-bold" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 110px 110px", background: "rgba(0,0,0,0.2)", color: "#6a9ab0", fontSize: 9, padding: "10px 20px", gap: 12 }}>
                <div>Person</div><div>Roll</div><div>Avdelning</div><div>Startdatum</div><div>Framsteg</div><div>Status</div>
              </div>
              {rows.map((r, i) => (
                <div key={r.name} className="bb-row grid items-center" style={{ gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 110px 110px", padding: "12px 20px", borderBottom: i === rows.length - 1 ? "none" : "1px solid rgba(26,61,88,0.4)", gap: 12, fontSize: 12 }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center font-bold text-[11px] shrink-0" style={{ width: 32, height: 32, borderRadius: 999, background: r.avatarBg, color: r.avatarColor }}>{r.initials}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-[13px] text-white truncate">{r.name}</div>
                      <div className="text-[11px] truncate" style={{ color: "#8ec8e0" }}>{r.role}</div>
                    </div>
                  </div>
                  <div className="text-foreground/90 truncate">{r.role}</div>
                  <div className="text-foreground/90 truncate">{r.dept}</div>
                  <div className="mono text-[11px]" style={{ color: "#6a9ab0" }}>{r.start}</div>
                  <div>
                    <div style={{ width: 80, height: 3, background: "#1a3d58", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${r.percent}%`, height: "100%", background: r.barColor }} />
                    </div>
                    <div className="mono text-[10px] mt-1" style={{ color: "#8ec8e0" }}>{r.percent}%</div>
                  </div>
                  <div>
                    <span className="mono font-bold rounded" style={{ ...statusStyle(r.status), fontSize: 10, padding: "3px 9px" }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Added companies */}
          {companies.map((c) => (
            <div key={c.name + c.email} style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
              <div className="flex items-center gap-4 flex-wrap" style={{ padding: "20px 24px" }}>
                <div className="flex items-center justify-center font-display font-bold text-[18px] shrink-0" style={{ width: 48, height: 48, borderRadius: 10, background: "#7dedb8", color: "#060f18" }}>{initialsOf(c.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-white text-[18px]">{c.name}</div>
                  {(c.city || c.description) && <div className="text-[12px]" style={{ color: "#6a9ab0" }}>{[c.city, c.description].filter(Boolean).join(" · ")}</div>}
                  {(c.email || c.phone) && <div className="mono text-[11px] mt-0.5" style={{ color: "#6a9ab0" }}>{[c.email, c.phone].filter(Boolean).join(" · ")}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-[11px] font-semibold px-3 py-1.5 rounded-md border" style={{ borderColor: "#1a3d58", color: "#edfaf4", background: "transparent" }}>Kontakta</button>
                  <button onClick={() => setManageData({ name: c.name, city: c.city, email: c.email, phone: c.phone, uthyrda: 0, godkanda: 0, pagar: 0, personnel: [] })} className="text-[11px] font-bold px-3 py-1.5 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>Hantera</button>
                </div>
              </div>
            </div>
          ))}

          {/* Add company card */}
          <button onClick={openModal} className="add-company flex flex-col items-center text-center" style={{ background: "transparent", border: "1px dashed #1a3d58", borderRadius: 10, padding: 40, marginTop: 8, cursor: "pointer", transition: "all .2s", gap: 12 }}>
            <Building2 size={40} strokeWidth={1.75} color="#1a3d58" />
            <div className="font-display font-bold text-white text-[18px]" style={{ marginTop: 8 }}>Lägg till bemanningsbolag</div>
            <div className="text-[13px]" style={{ color: "#6a9ab0", maxWidth: 400, lineHeight: 1.6 }}>Lägg till ett nytt bemanningsbolag för att hantera deras uthyrda personal i WorkReady</div>
            <span className="font-bold" style={{ background: "#7dedb8", color: "#060f18", padding: "12px 28px", borderRadius: 6, fontSize: 13, marginTop: 8 }}>+ Lägg till bolag</span>
          </button>
        </main>
      </div>

      {modalOpen && (
        <div onClick={closeModal} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] relative" style={{ background: "#0e2538", border: "1px solid #1a3d58", borderRadius: 12, padding: 32 }}>
            <button type="button" onClick={closeModal} aria-label="Stäng" className="absolute top-4 right-4 p-1 rounded hover:bg-white/5" style={{ color: "#6a9ab0" }}>
              <X size={18} strokeWidth={1.75} />
            </button>
            <h2 className="font-display font-bold text-white" style={{ fontSize: 20 }}>Lägg till bemanningsbolag</h2>
            <div className="flex flex-col gap-3 mt-5">
              {([
                { k: "name", label: "Företagsnamn", required: true, type: "text", ph: "t.ex. Studentconsulting AB" },
                { k: "city", label: "Ort", required: false, type: "text", ph: "t.ex. Göteborg" },
                { k: "description", label: "Beskrivning", required: false, type: "text", ph: "t.ex. Bemanning & Rekrytering" },
                { k: "email", label: "E-post", required: false, type: "email", ph: "info@foretag.se" },
                { k: "phone", label: "Telefon", required: false, type: "text", ph: "010-000 00 00" },
              ] as const).map((f) => (
                <label key={f.k} className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold mono uppercase" style={{ color: "#6a9ab0" }}>{f.label}{f.required ? " *" : ""}</span>
                  <input
                    type={f.type}
                    required={f.required}
                    placeholder={f.ph}
                    maxLength={f.k === "description" ? 200 : f.k === "email" ? 255 : 100}
                    value={form[f.k]}
                    onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
                    className="text-sm px-3 py-2 rounded-md outline-none focus:border-[#7dedb8]"
                    style={{ background: "#0b1e2d", border: "1px solid #1a3d58", color: "#edfaf4" }}
                  />
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button type="button" onClick={closeModal} className="text-xs font-semibold px-4 py-2 rounded-md border" style={{ borderColor: "#1a3d58", color: "#edfaf4", background: "transparent" }}>Avbryt</button>
              <button type="submit" className="text-xs font-bold px-4 py-2 rounded-md" style={{ background: "#7dedb8", color: "#060f18" }}>Lägg till</button>
            </div>
          </form>
        </div>
      )}

      <style>{sidebarKeyframes}</style>
      <style>{`
        .bb-row:hover { background: rgba(125,237,184,0.03); }
        .add-company:hover { border-color: #7dedb8 !important; background: rgba(125,237,184,0.02) !important; }
      `}</style>
      <ManageCompanyModal open={!!manageData} onClose={() => setManageData(null)} data={manageData} />
    </div>
  );
}
