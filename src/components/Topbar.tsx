import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { profil, loggaUt } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          to={profil?.roll === "chef" ? "/dashboard" : "/kurser"}
          className="text-xl font-bold text-primary"
        >
          Ready2Work
        </Link>
        {profil && (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {profil.namn} · {profil.foretag_namn}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await loggaUt();
                navigate({ to: "/login" });
              }}
            >
              Logga ut
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
