import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Trophy, Calendar, Users, BarChart3, PlaySquare,
  Hexagon, GitBranch, TableProperties, Menu, X,
  Radio, Star, ChevronRight, Ticket,
} from "lucide-react";
import { useGetFollowedTeams, useGetLiveMatches } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";

const navItems = [
  { href: "/",            label: "Dashboard",   icon: Hexagon,         shortLabel: "Home" },
  { href: "/matches",     label: "Matches",     icon: Calendar,        shortLabel: "Matches" },
  { href: "/teams",       label: "Teams",       icon: Users,           shortLabel: "Teams" },
  { href: "/standings",   label: "Group Tables",icon: TableProperties, shortLabel: "Groups" },
  { href: "/knockout",    label: "Knockout",    icon: GitBranch,       shortLabel: "Bracket" },
  { href: "/sweepstake",  label: "Sweepstake",  icon: Ticket,          shortLabel: "Draw" },
  { href: "/predictions", label: "Predictions", icon: BarChart3,       shortLabel: "Odds" },
  { href: "/highlights",  label: "Highlights",  icon: PlaySquare,      shortLabel: "Clips" },
];

const bottomTabItems = navItems.slice(0, 4);

function SidebarLink({
  item,
  isActive,
  onClick,
}: {
  item: typeof navItems[number];
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all group",
        isActive
          ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(204,255,0,0.25)]"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <item.icon
        className={cn(
          "w-5 h-5 shrink-0",
          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary",
        )}
      />
      <span className="flex-1 text-sm">{item.label}</span>
      {!isActive && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />}
    </Link>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { data: followedTeams } = useGetFollowedTeams();
  const { data: liveMatches } = useGetLiveMatches();
  const liveCount = liveMatches?.length ?? 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[320px] p-0 border-r border-border bg-background flex flex-col gap-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-black text-lg italic skew-x-[-10deg] shadow-[0_0_15px_rgba(204,255,0,0.4)]">
              W
            </div>
            <span className="font-black text-lg tracking-tight uppercase">
              World Cup <span className="text-primary">26</span>
            </span>
          </Link>
          <SheetClose asChild>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetClose>
        </div>

        {/* Live badge */}
        {liveCount > 0 && (
          <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-sm font-bold text-red-400 font-mono">
              {liveCount} match{liveCount !== 1 ? "es" : ""} live now
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <SidebarLink
                key={item.href}
                item={item}
                isActive={isActive}
                onClick={onClose}
              />
            );
          })}
        </nav>

        {/* Followed teams */}
        {followedTeams && followedTeams.length > 0 && (
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Following
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {followedTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all"
                >
                  <img
                    src={`https://flagcdn.com/w20/${team.flagCode}.png`}
                    className="w-4 h-auto rounded-sm"
                    alt=""
                  />
                  <span className="text-xs font-medium">{team.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-6 pt-3 border-t border-border flex items-center gap-2">
          <Radio className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Live Broadcast Feed
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { data: liveMatches } = useGetLiveMatches();
  const liveCount = liveMatches?.length ?? 0;

  return (
    <header className="md:hidden h-14 border-b border-border bg-background flex items-center justify-between px-4 z-10 shrink-0">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-black text-base italic skew-x-[-10deg] shadow-[0_0_10px_rgba(204,255,0,0.3)]">
          W
        </div>
        <span className="font-black tracking-tight uppercase text-base">
          WC <span className="text-primary">26</span>
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {liveCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            <span className="text-[10px] font-bold text-red-400 font-mono tabular-nums">
              {liveCount} LIVE
            </span>
          </div>
        )}
        <button
          onClick={onMenuOpen}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-foreground hover:bg-secondary hover:border-primary/40 transition-all active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
}

function BottomTabBar() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md safe-area-pb">
      <div className="flex items-stretch h-16">
        {bottomTabItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "drop-shadow-[0_0_6px_rgba(204,255,0,0.8)]",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-wide leading-none font-bold transition-all",
                  isActive ? "text-primary" : "text-muted-foreground/60",
                )}
              >
                {item.shortLabel}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
        {/* More button — last tab opens full drawer */}
        <MoreTab />
      </div>
    </nav>
  );
}

function MoreTab() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const moreRoutes = navItems.slice(4).map((i) => i.href);
  const isActive = moreRoutes.some(
    (r) => location === r || location.startsWith(r),
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
        aria-label="More pages"
      >
        <Menu
          className={cn(
            "w-5 h-5 transition-all",
            isActive && "drop-shadow-[0_0_6px_rgba(204,255,0,0.8)]",
          )}
        />
        <span
          className={cn(
            "text-[10px] font-mono uppercase tracking-wide leading-none font-bold",
            isActive ? "text-primary" : "text-muted-foreground/60",
          )}
        >
          More
        </span>
        {isActive && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
        )}
      </button>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: followedTeams } = useGetFollowedTeams();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm font-black text-xl italic skew-x-[-10deg] group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.5)]">
              W
            </div>
            <span className="font-black text-xl tracking-tight uppercase">
              World Cup <span className="text-primary">26</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-5 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <SidebarLink key={item.href} item={item} isActive={isActive} />
            );
          })}
        </nav>

        {followedTeams && followedTeams.length > 0 && (
          <div className="border-t border-border px-4 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Following
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {followedTeams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all"
                >
                  <img
                    src={`https://flagcdn.com/w20/${team.flagCode}.png`}
                    className="w-3.5 h-auto rounded-sm"
                    alt=""
                  />
                  <span className="text-xs font-medium">{team.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-border flex items-center gap-2">
          <Radio className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
            Live Broadcast Feed
          </span>
        </div>
      </aside>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />

        {/* Content — add bottom padding on mobile for the tab bar */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-8 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

        {/* Bottom tab bar */}
        <BottomTabBar />
      </main>
    </div>
  );
}
