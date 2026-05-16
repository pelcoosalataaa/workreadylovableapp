import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Video,
  CircleDot,
  Grid3x3,
  Award,
  AlertTriangle,
  RefreshCw,
  Building2,
  Settings,
  type LucideIcon,
} from "lucide-react";

const navItems: { Icon: LucideIcon; label: string; to?: string; badge?: number }[] = [
  { Icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { Icon: Users, label: "Personal", to: "/personal", badge: 3 },
  { Icon: Video, label: "Moduler", to: "/moduler" },
  { Icon: CircleDot, label: "Spela in", to: "/spela-in" },
  { Icon: Grid3x3, label: "Kompetensmatris", to: "/kompetensmatris" },
  { Icon: Award, label: "Certifikat", to: "/certifikat" },
  { Icon: AlertTriangle, label: "Utgående certifikat", to: "/utgaende-certifikat", badge: 2 },
  { Icon: RefreshCw, label: "Inhyrd personal", to: "/inhyrd-personal" },
  { Icon: Building2, label: "Bemanningsbolag", to: "/bemanningsbolag" },
  { Icon: Settings, label: "Inställningar", to: "/installningar" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] border-r border-border flex flex-col" style={{ background: "#0b1e2d" }}>
      <div className="p-5 border-b border-border">
        <div className="font-display font-bold text-[22px] text-foreground">WorkReady</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="live-dot" />
          <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "#7dedb8" }}>by Partner2Work AB</span>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.to ? pathname === item.to : false;
          const className = `group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors relative w-full ${
            active ? "text-primary font-semibold" : "text-foreground/80 hover:bg-white/5"
          }`;
          const style = active
            ? { background: "rgba(125,237,184,0.08)", borderLeft: "2px solid #7dedb8", paddingLeft: "10px" }
            : undefined;
          const Icon = item.Icon;
          const inner = (
            <>
              <span className="w-5 flex items-center justify-center">
                <Icon size={16} strokeWidth={1.75} color={active ? "#7dedb8" : "rgba(237,250,244,0.6)"} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ff4d6a", color: "#fff" }}>
                  {item.badge}
                </span>
              )}
            </>
          );
          return item.to ? (
            <Link key={item.label} to={item.to} className={className} style={style}>{inner}</Link>
          ) : (
            <button key={item.label} className={className} style={style} type="button">{inner}</button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-sm" style={{ background: "#7dedb8", color: "#060f18" }}>BE</div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">Byggelement AB</div>
          <div className="text-[11px] text-muted-foreground truncate">Ucklum · Admin</div>
        </div>
      </div>
    </aside>
  );
}

export const sidebarKeyframes = `
  @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,224,150,0.6)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(0,224,150,0)} }
  @keyframes redPulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,77,106,0.5)} 50%{opacity:.5;box-shadow:0 0 0 6px rgba(255,77,106,0)} }
  @keyframes mintPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .live-dot{width:8px;height:8px;border-radius:999px;background:#00e096;animation:livePulse 2s infinite}
  .red-dot{width:8px;height:8px;border-radius:999px;background:#ff4d6a;animation:redPulse 1.6s infinite}
  .mint-pulse{animation:mintPulse 1.5s infinite}
  .shimmer-bar{background:linear-gradient(90deg,#1a3d58,#7dedb8,#1a3d58);background-size:200% 100%;animation:shimmer 2s linear infinite}
  .mono{font-family:'Space Mono',ui-monospace,monospace;letter-spacing:.08em}
`;
