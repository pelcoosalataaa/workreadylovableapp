import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopBar, PrimaryBtn, SecondaryBtn } from "@/components/AppTopBar";
import { MoreHorizontal, Search, X, Copy, Check, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ROLES,
  DEPARTMENTS,
  DEPARTMENT_FILTERS,
  STAFFING_PARTNERS,
  fetchPersonal,
  fetchAvdelningar,
  fetchForetagId,
  type PersonRow,
} from "@/lib/workforce";

export const Route = createFileRoute("/arbetskraft")({
  component: ArbetskraftPage,
});

// ---------- View types ----------

type EmploymentType = "Egen personal" | "Inhyrd personal";
type StatusKey = "redo" | "pagar" | "ej-start";

type Worker = {
  id: string;
  initials: string;
  avatarColor: { bg: string; color: string };
  firstName: string;
  lastName: string;
  role: string;
  shift: string;
  department: string;
  employmentType: EmploymentType;
  agency?: string;
  startDate: string;
  progress: number;
  status: StatusKey;
  certs: { text: string; tone: "ok" | "warn" | "bad" }[];
  phone?: string;
  email?: string;
};

function avatarFor(status: StatusKey) {
  if (status === "redo") return { bg: "#d1fae5", color: "#065f46" };
  if (status === "pagar") return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#fee2e2", color: "#991b1b" };
}

function statusFromDb(s: string): StatusKey {
  if (s === "redo") return "redo";
  if (s === "pagaende" || s === "pagar") return "pagar";
  return "ej-start";
}

function statusToDb(s: StatusKey): string {
  if (s === "redo") return "redo";
  if (s === "pagar") return "pagaende";
  return "ej_paborjat";
}

function rowToWorker(p: PersonRow): Worker {
  const status = statusFromDb(p.status);
  return {
    id: p.id,
    initials: ((p.fornamn[0] ?? "") + (p.efternamn[0] ?? "")).toUpperCase(),
    avatarColor: avatarFor(status),
    firstName: p.fornamn,
    lastName: p.efternamn,
    role: p.roll ?? "",
    shift: "Dag",
    department: p.avdelning_namn ?? "",
    employmentType: p.anstallningstyp === "inhyrd" ? "Inhyrd personal" : "Egen personal",
    agency: p.bemanningsbolag ?? undefined,
    startDate: p.startdatum ?? "",
    progress: p.framsteg ?? 0,
    status,
    certs: [],
    phone: p.telefon ?? undefined,
    email: p.epost ?? undefined,
  };
}

type StatusFilter = "alla" | "redo" | "pagar" | "ej-start" | "egen" | "inhyrd";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "alla", label: "Alla" },
  { id: "redo", label: "Redo för arbete" },
  { id: "pagar", label: "Under upplärning" },
  { id: "ej-start", label: "Ej påbörjat" },
  { id: "egen", label: "Egen personal" },
  { id: "inhyrd", label: "Inhyrd personal" },
];

// ---------- Shared style ----------

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

function StatusBadge({ status }: { status: StatusKey }) {
  const map = {
    redo: { bg: "#d1fae5", color: "#065f46", label: "Redo" },
    pagar: { bg: "#fef3c7", color: "#92400e", label: "Pågår" },
    "ej-start": { bg: "#fee2e2", color: "#991b1b", label: "Ej påbörjat" },
  } as const;
  const s = map[status];
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function EmploymentBadge({ w }: { w: Worker }) {
  if (w.employmentType === "Egen personal") {
    return (
      <span style={{ background: "#f3f4f6", color: "#374151", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
        Egen personal
      </span>
    );
  }
  return (
    <span style={{ background: "#dbeafe", color: "#1e40af", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {w.agency ?? "Inhyrd"}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 100 ? "#10b981" : value >= 50 ? "#f59e0b" : value === 0 ? "#ef4444" : "#3b82f6";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 80, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, transition: "width .2s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 36, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

// ---------- Page ----------

function ArbetskraftPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alla");
  const [deptFilter, setDeptFilter] = useState<string>("Alla avdelningar");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailWorker, setDetailWorker] = useState<Worker | null>(null);

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

  const reload = async () => {
    setLoading(true);
    try {
      const rows = await fetchPersonal();
      setWorkers(rows.map(rowToWorker));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ready) void reload();
  }, [ready]);

  const filtered = useMemo(() => {
    return workers.filter((w) => {
      if (statusFilter === "redo" && w.status !== "redo") return false;
      if (statusFilter === "pagar" && w.status !== "pagar") return false;
      if (statusFilter === "ej-start" && w.status !== "ej-start") return false;
      if (statusFilter === "egen" && w.employmentType !== "Egen personal") return false;
      if (statusFilter === "inhyrd" && w.employmentType !== "Inhyrd personal") return false;
      if (deptFilter !== "Alla avdelningar" && w.department !== deptFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${w.firstName} ${w.lastName} ${w.role} ${w.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [workers, statusFilter, deptFilter, query]);

  const totals = useMemo(() => ({
    total: workers.length,
    redo: workers.filter((w) => w.status === "redo").length,
    pagar: workers.filter((w) => w.status === "pagar").length,
    ej: workers.filter((w) => w.status === "ej-start").length,
  }), [workers]);

  if (!ready) return <div style={{ minHeight: "100vh", background: "#f0f2f5" }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex" }}>
      <AppSidebar />
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column" }}>
        <AppTopBar
          title="Arbetskraft"
          action={<PrimaryBtn onClick={() => setAddOpen(true)}>+ Lägg till medarbetare</PrimaryBtn>}
        />
        <main style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 22, color: "#111827", margin: 0 }}>
                Arbetskraft
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                Byggelement AB · Ucklum · {workers.length} aktiva medarbetare
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sök namn, roll, avdelning..."
                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px 9px 32px", fontSize: 13, color: "#111827", width: 280, outline: "none" }}
                />
              </div>
            </div>
          </div>

          <section style={{ ...CARD_STYLE, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_FILTERS.map((f) => (
                <FilterPill
                  key={f.id}
                  label={f.label}
                  active={statusFilter === f.id}
                  activeStyle={pillActiveStyleFor(f.id)}
                  onClick={() => setStatusFilter(f.id)}
                />
              ))}
            </div>
            <div style={{ height: 1, background: "#f3f4f6" }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DEPARTMENT_FILTERS.map((d) => (
                <FilterPill
                  key={d}
                  label={d}
                  active={deptFilter === d}
                  activeStyle={{ background: "#0b1e2d", color: "#fff", borderColor: "#0b1e2d" }}
                  onClick={() => setDeptFilter(d)}
                />
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <MetricCard color="#3b82f6" label="TOTAL" value={String(totals.total)} sub="medarbetare" />
            <MetricCard color="#10b981" label="REDO" value={String(totals.redo)} sub={`${totals.total ? Math.round((totals.redo / totals.total) * 100) : 0}% av alla`} />
            <MetricCard color="#f59e0b" label="PÅGÅR" value={String(totals.pagar)} sub="under upplärning" />
            <MetricCard color="#ef4444" label="EJ PÅBÖRJAT" value={String(totals.ej)} sub="kräver åtgärd" />
          </div>

          <section style={{ ...CARD_STYLE, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>Alla medarbetare ({filtered.length})</h3>
              <SecondaryBtn style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => toast.success("Export förbereds...")}>Exportera</SecondaryBtn>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {["MEDARBETARE", "AVDELNING", "ANSTÄLLNINGSTYP", "STARTDATUM", "FRAMSTEG", "STATUS", "ÅTGÄRD"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#6b7280", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => (
                    <WorkerRow key={w.id} w={w} onOpen={() => setDetailWorker(w)} onDelete={async () => {
                      await supabase.from("personal").delete().eq("id", w.id);
                      toast.success(`${w.firstName} ${w.lastName} borttagen`);
                      void reload();
                    }} />
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#6b7280", fontSize: 13 }}>Inga medarbetare matchar filtren.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#6b7280", fontSize: 13 }}>Hämtar…</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <AddWorkerModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => { void reload(); }}
      />
      <PersonDetailModal worker={detailWorker} onClose={() => setDetailWorker(null)} />
    </div>
  );
}

// ---------- Filter pill ----------

function FilterPill({ label, active, activeStyle, onClick }: { label: string; active: boolean; activeStyle: React.CSSProperties; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ border: "1px solid #e5e7eb", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#374151", cursor: "pointer", transition: "all .15s", ...(active ? activeStyle : {}) }}
    >
      {label}
    </button>
  );
}

function pillActiveStyleFor(id: StatusFilter): React.CSSProperties {
  switch (id) {
    case "redo": return { background: "#d1fae5", color: "#065f46", borderColor: "#10b981" };
    case "pagar": return { background: "#fef3c7", color: "#92400e", borderColor: "#f59e0b" };
    case "ej-start": return { background: "#fee2e2", color: "#991b1b", borderColor: "#ef4444" };
    default: return { background: "#0b1e2d", color: "#fff", borderColor: "#0b1e2d" };
  }
}

function MetricCard({ color, label, value, sub }: { color: string; label: string; value: string; sub: string }) {
  return (
    <div style={{ ...CARD_STYLE, borderLeft: `4px solid ${color}`, padding: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 40, color, lineHeight: 1.1, margin: "8px 0 4px" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{sub}</div>
    </div>
  );
}

// ---------- Worker row ----------

function WorkerRow({ w, onOpen, onDelete }: { w: Worker; onOpen: () => void; onDelete: () => void }) {
  return (
    <tr
      style={{ borderBottom: "1px solid #f9fafb", cursor: "pointer", transition: "background .15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      onClick={onOpen}
    >
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: w.avatarColor.bg, color: w.avatarColor.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{w.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{w.firstName} {w.lastName}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{w.role}{w.shift ? ` · ${w.shift}` : ""}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: "14px 20px", color: "#374151" }}>{w.department}</td>
      <td style={{ padding: "14px 20px" }}><EmploymentBadge w={w} /></td>
      <td style={{ padding: "14px 20px", fontFamily: "'Space Mono', ui-monospace, monospace", fontSize: 11, color: "#6b7280" }}>{w.startDate}</td>
      <td style={{ padding: "14px 20px" }}><ProgressBar value={w.progress} /></td>
      <td style={{ padding: "14px 20px" }}><StatusBadge status={w.status} /></td>
      <td style={{ padding: "14px 20px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
        <ActionMenu w={w} onOpenDetail={onOpen} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function copyLinkFor(w: Worker) {
  const slug = `${w.firstName}-${w.lastName}`.toLowerCase();
  const link = `${window.location.origin}/mobil?personal=${slug}`;
  navigator.clipboard.writeText(link);
  return link;
}

function ActionMenu({ w, onOpenDetail, onDelete }: { w: Worker; onOpenDetail: () => void; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Åtgärder" style={{ background: "transparent", border: "none", padding: 6, cursor: "pointer", color: "#6b7280", borderRadius: 6 }}>
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 4, minWidth: 200 }}>
        <DropdownMenuItem onClick={onOpenDetail} style={{ fontSize: 13, cursor: "pointer" }}>Visa profil</DropdownMenuItem>
        <DropdownMenuItem onClick={() => { copyLinkFor(w); toast.success("Utbildningslänk kopierad!"); }} style={{ fontSize: 13, cursor: "pointer" }}>
          Kopiera utbildningslänk
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast.success("SMS skickat!")} style={{ fontSize: 13, cursor: "pointer" }}>
          Skicka SMS-påminnelse
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast("Redigeringsläge öppnas...")} style={{ fontSize: 13, cursor: "pointer" }}>Redigera</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} style={{ fontSize: 13, cursor: "pointer", color: "#dc2626" }}>Ta bort</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- Person detail modal ----------

function PersonDetailModal({ worker, onClose }: { worker: Worker | null; onClose: () => void }) {
  const [tab, setTab] = useState<"oversikt" | "utbildning" | "certifikat">("oversikt");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (worker) setTab("oversikt");
  }, [worker]);

  if (!worker) return null;

  const slug = `${worker.firstName}-${worker.lastName}`.toLowerCase();
  const link = typeof window !== "undefined" ? `${window.location.origin}/mobil?personal=${slug}` : `/mobil?personal=${slug}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Länk kopierad!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!worker} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[560px] p-0 border-0" style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: worker.avatarColor.bg, color: worker.avatarColor.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>{worker.initials}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#111827", margin: 0 }}>{worker.firstName} {worker.lastName}</h3>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>{worker.role}{worker.shift ? ` · ${worker.shift}` : ""}</p>
          </div>
          <button onClick={onClose} type="button" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }} aria-label="Stäng">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: 20 }}>
          {([["oversikt", "Översikt"], ["utbildning", "Utbildning"], ["certifikat", "Certifikat"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              style={{ background: "transparent", border: "none", padding: "8px 14px", fontSize: 13, fontWeight: 600, color: tab === id ? "#0b1e2d" : "#6b7280", borderBottom: tab === id ? "2px solid #0b1e2d" : "2px solid transparent", cursor: "pointer", marginBottom: -1 }}
            >{label}</button>
          ))}
        </div>

        {tab === "oversikt" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <DetailField label="Avdelning" value={worker.department} />
            <DetailField label="Anställningstyp" value={worker.employmentType} />
            <DetailField label="Startdatum" value={worker.startDate} />
            <DetailField label="Bemanningsbolag" value={worker.agency ?? "—"} />
            <DetailField label="Status" value={<StatusBadge status={worker.status} />} />
            <DetailField label="Framsteg" value={<ProgressBar value={worker.progress} />} />
          </div>
        )}

        {(tab === "utbildning" || tab === "certifikat") && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Visa certifikat och kursresultat i översikten /certifikat.
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Utbildningslänk</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={link} style={{ flex: 1, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#374151", fontFamily: "'Space Mono', ui-monospace, monospace", outline: "none" }} />
            <button type="button" onClick={copy} style={{ background: "#7dedb8", color: "#0b1e2d", border: "none", borderRadius: 8, padding: "0 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Kopierad" : "Kopiera"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <SecondaryBtn onClick={onClose}>Stäng</SecondaryBtn>
          <PrimaryBtn onClick={() => toast.success("SMS med utbildningslänk skickat!")}>Skicka utbildningslänk via SMS</PrimaryBtn>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

// ---------- Add worker modal (Supabase INSERT) ----------

function AddWorkerModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [employment, setEmployment] = useState<EmploymentType>("Egen personal");
  const [agency, setAgency] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [avdelningar, setAvdelningar] = useState<{ id: string; namn: string }[]>([]);

  useEffect(() => {
    if (!open) return;
    void fetchAvdelningar().then(setAvdelningar);
  }, [open]);

  const reset = () => {
    setFirst(""); setLast(""); setPhone(""); setEmail(""); setRole("");
    setDepartment(""); setEmployment("Egen personal"); setAgency(""); setStartDate(undefined);
  };

  const submit = async () => {
    if (!first || !last || !role || !department || !startDate) {
      toast.error("Fyll i alla obligatoriska fält");
      return;
    }
    setSaving(true);
    try {
      const foretagId = await fetchForetagId();
      const avd = avdelningar.find((a) => a.namn === department);
      const { error } = await supabase.from("personal").insert({
        foretag_id: foretagId,
        avdelning_id: avd?.id ?? null,
        fornamn: first,
        efternamn: last,
        roll: role,
        telefon: phone || null,
        epost: email || null,
        anstallningstyp: employment === "Inhyrd personal" ? "inhyrd" : "egen",
        bemanningsbolag: employment === "Inhyrd personal" ? (agency || null) : null,
        startdatum: format(startDate, "yyyy-MM-dd"),
        framsteg: 0,
        status: statusToDb("ej-start"),
      });
      if (error) throw error;
      toast.success(`${first} ${last} tillagd & SMS skickat!`);
      onAdded();
      reset();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[560px] p-0 border-0" style={{ background: "#fff", borderRadius: 12, padding: 32 }}>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: "#111827", margin: "0 0 20px" }}>
          Lägg till medarbetare
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormInput label="Förnamn *" value={first} onChange={setFirst} placeholder="Anna" />
          <FormInput label="Efternamn *" value={last} onChange={setLast} placeholder="Andersson" />
          <FormInput label="Telefonnummer (för SMS)" value={phone} onChange={setPhone} placeholder="+46 70 123 45 67" />
          <FormInput label="E-post" value={email} onChange={setEmail} placeholder="anna@exempel.se" />
          <div>
            <FormLabel>Roll *</FormLabel>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
              <option value="">Välj roll...</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Avdelning *</FormLabel>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={selectStyle}>
              <option value="">Välj avdelning...</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <FormLabel>Anställningstyp *</FormLabel>
            <select value={employment} onChange={(e) => setEmployment(e.target.value as EmploymentType)} style={selectStyle}>
              <option value="Egen personal">Egen personal</option>
              <option value="Inhyrd personal">Inhyrd personal</option>
            </select>
          </div>
          {employment === "Inhyrd personal" && (
            <div>
              <FormLabel>Bemanningsbolag</FormLabel>
              <select value={agency} onChange={(e) => setAgency(e.target.value)} style={selectStyle}>
                <option value="">Välj bolag...</option>
                {STAFFING_PARTNERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
          <div style={{ gridColumn: "1 / -1" }}>
            <FormLabel>Startdatum *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" style={{ ...selectStyle, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: startDate ? "#111827" : "#9ca3af" }}>
                  <span>{startDate ? format(startDate, "yyyy-MM-dd") : "Välj datum"}</span>
                  <CalendarIcon size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <SecondaryBtn onClick={() => { reset(); onClose(); }}>Avbryt</SecondaryBtn>
          <PrimaryBtn onClick={submit} disabled={saving}>{saving ? "Sparar..." : "Lägg till & Skicka SMS"}</PrimaryBtn>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
  padding: "9px 12px", fontSize: 13, color: "#111827", outline: "none", fontFamily: "Inter, sans-serif",
};

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
      {children}
    </label>
  );
}

function FormInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={selectStyle} />
    </div>
  );
}
