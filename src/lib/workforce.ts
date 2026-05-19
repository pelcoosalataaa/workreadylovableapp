// Shared data / constants for WorkReady workforce.
// Concrete industry: Betong & Prefab — Skandinaviska Byggelement AB, Ucklum.

import { supabase } from "@/integrations/supabase/client";

export const ROLES = [
  "Gjutare",
  "Armerare",
  "Formbyggare",
  "Betongarbetare",
  "Efterbehandlare",
  "Kranförare",
] as const;

export type Role = (typeof ROLES)[number];

export const INDUSTRIES = ["Betong & Prefab"] as const;

export const DEPARTMENTS = [
  "Snickeriavdelning / Formbyggnad",
  "Gul hallen",
  "Rosa hallen",
  "Gröna hallen",
  "Armeringsavdelning",
  "Lap och Lag",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_FILTERS = ["Alla avdelningar", ...DEPARTMENTS] as const;

export const STAFFING_PARTNERS = ["Partner2Work AB"] as const;

// ---------- Supabase row types ----------

export type PersonRow = {
  id: string;
  foretag_id: string | null;
  avdelning_id: string | null;
  fornamn: string;
  efternamn: string;
  roll: string | null;
  telefon: string | null;
  epost: string | null;
  anstallningstyp: string | null; // 'egen' | 'inhyrd'
  bemanningsbolag: string | null;
  startdatum: string | null;
  framsteg: number;
  status: string; // 'redo' | 'pagaende' | 'ej_paborjat'
  skapad_at: string;
  avdelning_namn?: string | null;
};

export type CertRow = {
  id: string;
  personal_id: string | null;
  foretag_id: string | null;
  certifikattyp: string;
  utfardat: string | null;
  utgaar: string | null;
  status: string | null; // 'giltig' | 'utgaar_snart' | 'saknas'
  personal?: { fornamn: string; efternamn: string; roll: string | null } | null;
};

export type PartnerRow = {
  id: string;
  foretag_id: string | null;
  namn: string;
  ort: string | null;
  epost: string | null;
  telefon: string | null;
};

// ---------- Helpers ----------

export function initialsOf(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase();
}

export function fullName(p: { fornamn: string; efternamn: string }): string {
  return `${p.fornamn} ${p.efternamn}`;
}

export function statusLabel(s: string): "Redo" | "Pågår" | "Ej påbörjat" {
  if (s === "redo") return "Redo";
  if (s === "pagaende" || s === "pagar") return "Pågår";
  return "Ej påbörjat";
}

// ---------- Fetchers ----------

export async function fetchPersonal(): Promise<PersonRow[]> {
  const { data, error } = await supabase
    .from("personal")
    .select("*, avdelningar(namn)")
    .order("skapad_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const av = r.avdelningar as { namn: string } | null;
    return { ...(r as unknown as PersonRow), avdelning_namn: av?.namn ?? null };
  });
}

export async function fetchCertifikat(): Promise<CertRow[]> {
  const { data, error } = await supabase
    .from("certifikat")
    .select("*, personal(fornamn, efternamn, roll)")
    .order("skapad_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CertRow[];
}

export async function fetchPartners(): Promise<PartnerRow[]> {
  const { data, error } = await supabase
    .from("bemanningspartners")
    .select("*")
    .order("skapad_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as PartnerRow[];
}

export async function fetchAvdelningar(): Promise<{ id: string; namn: string }[]> {
  const { data, error } = await supabase
    .from("avdelningar")
    .select("id, namn")
    .order("skapad_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { id: string; namn: string }[];
}

export async function fetchForetagId(): Promise<string | null> {
  const { data, error } = await supabase
    .from("foretag")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
