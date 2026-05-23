import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Profil = {
  id: string;
  foretag_id: string;
  foretag_namn: string;
  namn: string;
  epost: string;
  roll: "chef" | "anstalld";
};

type Ctx = {
  user: User | null;
  session: Session | null;
  profil: Profil | null;
  loading: boolean;
  laddaProfil: () => Promise<void>;
  loggaUt: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);

  const hamtaProfil = async (uid: string) => {
    const { data } = await supabase.from("anvandare").select("*").eq("id", uid).maybeSingle();
    setProfil((data as Profil | null) ?? null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => hamtaProfil(s.user.id), 0);
      } else {
        setProfil(null);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) await hamtaProfil(s.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        profil,
        loading,
        laddaProfil: async () => { if (user) await hamtaProfil(user.id); },
        loggaUt: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth utanför AuthProvider");
  return c;
}
