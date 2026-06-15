import { Link, useLocation } from "wouter";
import { Trophy, Calendar, Users, BarChart3, TrendingUp, PlaySquare, Hexagon } from "lucide-react";
import { useGetFollowedTeams } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: followedTeams } = useGetFollowedTeams();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Hexagon },
    { href: "/matches", label: "Matches", icon: Calendar },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/standings", label: "Standings", icon: Trophy },
    { href: "/predictions", label: "Predictions", icon: BarChart3 },
    { href: "/highlights", label: "Highlights", icon: PlaySquare },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-black text-xl italic skew-x-[-10deg] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.5)]">
              W
            </div>
            <span className="font-black text-xl tracking-tight uppercase">World Cup <span className="text-primary">26</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(204,255,0,0.2)]" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border text-xs text-muted-foreground font-mono uppercase tracking-wider text-center">
          Live Broadcast Feed
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-background flex items-center justify-between px-4 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-black italic skew-x-[-10deg]">
              W
            </div>
            <span className="font-black tracking-tight uppercase">WC <span className="text-primary">26</span></span>
          </Link>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
