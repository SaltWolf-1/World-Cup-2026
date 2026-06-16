import { cn } from "@/lib/utils";
import { Trophy, ChevronRight } from "lucide-react";

type Slot = {
  label: string;
  qualifier?: string;
  flagCode?: string;
  score?: number | null;
  winner?: boolean;
};

type BracketMatch = {
  id: string;
  date: string;
  venue: string;
  home: Slot;
  away: Slot;
  completed?: boolean;
};

type Round = {
  name: string;
  shortName: string;
  matches: BracketMatch[];
};

function qualifierBadge(label: string) {
  const clean = label.replace(/^W\d+$/, "TBD").replace(/^L\d+$/, "TBD");
  const isGroup = /^\d[A-L]$/.test(clean);
  const isThird = /^3/.test(clean);
  return { text: isGroup || isThird ? clean : clean, isGroup, isTbd: clean === "TBD" };
}

const rounds: Round[] = [
  {
    name: "Round of 32",
    shortName: "R32",
    matches: [
      { id: "r32-1",  date: "Jun 28", venue: "Los Angeles",       home: { label: "2A" }, away: { label: "2B" } },
      { id: "r32-2",  date: "Jun 29", venue: "Boston",            home: { label: "1E" }, away: { label: "3A/B/C/D/F" } },
      { id: "r32-3",  date: "Jun 29", venue: "Monterrey",         home: { label: "1F" }, away: { label: "2C" } },
      { id: "r32-4",  date: "Jun 29", venue: "Houston",           home: { label: "1C" }, away: { label: "2F" } },
      { id: "r32-5",  date: "Jun 30", venue: "New York/NJ",       home: { label: "1I" }, away: { label: "3C/D/F/G/H" } },
      { id: "r32-6",  date: "Jun 30", venue: "Dallas",            home: { label: "2E" }, away: { label: "2I" } },
      { id: "r32-7",  date: "Jun 30", venue: "Mexico City",       home: { label: "1A" }, away: { label: "3C/E/F/H/I" } },
      { id: "r32-8",  date: "Jul 1",  venue: "Atlanta",           home: { label: "1L" }, away: { label: "3E/H/I/J/K" } },
      { id: "r32-9",  date: "Jul 1",  venue: "San Francisco",     home: { label: "1D" }, away: { label: "3B/E/F/I/J" } },
      { id: "r32-10", date: "Jul 1",  venue: "Seattle",           home: { label: "1G" }, away: { label: "3A/E/H/I/J" } },
      { id: "r32-11", date: "Jul 2",  venue: "Toronto",           home: { label: "2K" }, away: { label: "2L" } },
      { id: "r32-12", date: "Jul 2",  venue: "Los Angeles",       home: { label: "1H" }, away: { label: "2J" } },
      { id: "r32-13", date: "Jul 2",  venue: "Vancouver",         home: { label: "1B" }, away: { label: "3E/F/G/I/J" } },
      { id: "r32-14", date: "Jul 3",  venue: "Miami",             home: { label: "1J" }, away: { label: "2H" } },
      { id: "r32-15", date: "Jul 3",  venue: "Kansas City",       home: { label: "1K" }, away: { label: "3D/E/I/J/L" } },
      { id: "r32-16", date: "Jul 3",  venue: "Dallas",            home: { label: "2D" }, away: { label: "2G" } },
    ],
  },
  {
    name: "Round of 16",
    shortName: "R16",
    matches: [
      { id: "r16-1", date: "Jul 4", venue: "Philadelphia",  home: { label: "W R32-2" }, away: { label: "W R32-5" } },
      { id: "r16-2", date: "Jul 4", venue: "Houston",       home: { label: "W R32-1" }, away: { label: "W R32-3" } },
      { id: "r16-3", date: "Jul 5", venue: "New York/NJ",   home: { label: "W R32-4" }, away: { label: "W R32-6" } },
      { id: "r16-4", date: "Jul 5", venue: "Mexico City",   home: { label: "W R32-7" }, away: { label: "W R32-8" } },
      { id: "r16-5", date: "Jul 6", venue: "Dallas",        home: { label: "W R32-11" }, away: { label: "W R32-12" } },
      { id: "r16-6", date: "Jul 6", venue: "Seattle",       home: { label: "W R32-9" }, away: { label: "W R32-10" } },
      { id: "r16-7", date: "Jul 7", venue: "Atlanta",       home: { label: "W R32-14" }, away: { label: "W R32-16" } },
      { id: "r16-8", date: "Jul 7", venue: "Vancouver",     home: { label: "W R32-13" }, away: { label: "W R32-15" } },
    ],
  },
  {
    name: "Quarter-finals",
    shortName: "QF",
    matches: [
      { id: "qf-1", date: "Jul 9",  venue: "Boston",        home: { label: "W R16-1" }, away: { label: "W R16-2" } },
      { id: "qf-2", date: "Jul 10", venue: "Los Angeles",   home: { label: "W R16-5" }, away: { label: "W R16-6" } },
      { id: "qf-3", date: "Jul 11", venue: "Miami",         home: { label: "W R16-3" }, away: { label: "W R16-4" } },
      { id: "qf-4", date: "Jul 11", venue: "Kansas City",   home: { label: "W R16-7" }, away: { label: "W R16-8" } },
    ],
  },
  {
    name: "Semi-finals",
    shortName: "SF",
    matches: [
      { id: "sf-1", date: "Jul 14", venue: "Dallas",        home: { label: "W QF-1" }, away: { label: "W QF-2" } },
      { id: "sf-2", date: "Jul 15", venue: "Atlanta",       home: { label: "W QF-3" }, away: { label: "W QF-4" } },
    ],
  },
  {
    name: "Final",
    shortName: "Final",
    matches: [
      { id: "final", date: "Jul 19", venue: "New York/NJ",  home: { label: "W SF-1" }, away: { label: "W SF-2" } },
    ],
  },
];

const thirdPlace: BracketMatch = {
  id: "3rd",
  date: "Jul 18",
  venue: "Miami",
  home: { label: "L SF-1" },
  away: { label: "L SF-2" },
};

function SlotRow({ slot, side = "home" }: { slot: Slot; side?: "home" | "away" }) {
  const { text, isGroup, isTbd } = qualifierBadge(slot.label);
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 text-sm",
      slot.winner && "bg-primary/10",
    )}>
      {slot.flagCode && (
        <img
          src={`https://flagcdn.com/w20/${slot.flagCode}.png`}
          className="w-4 h-auto rounded-sm shrink-0"
          alt=""
        />
      )}
      <span className={cn(
        "font-mono font-bold truncate max-w-[120px]",
        isTbd ? "text-muted-foreground/40 text-xs" : isGroup ? "text-primary text-xs tracking-widest" : "text-muted-foreground text-xs tracking-wide",
        slot.winner && "text-primary",
      )}>
        {text}
      </span>
      {slot.score !== undefined && slot.score !== null && (
        <span className={cn(
          "ml-auto font-black font-mono text-base tabular-nums",
          slot.winner ? "text-primary" : "text-foreground/60",
        )}>
          {slot.score}
        </span>
      )}
    </div>
  );
}

function MatchCard({ match, size = "md" }: { match: BracketMatch; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:border-primary/40 transition-all group",
      size === "lg" && "border-primary/30 shadow-[0_0_20px_rgba(232,25,60,0.08)]",
    )}>
      <div className={cn(
        "px-3 py-1 border-b border-border flex items-center justify-between gap-2",
        size === "lg" ? "bg-primary/5" : "bg-muted/40",
      )}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">{match.venue}</span>
        <span className="font-mono text-[10px] text-muted-foreground shrink-0">{match.date}</span>
      </div>
      <div className="divide-y divide-border/60">
        <SlotRow slot={match.home} />
        <SlotRow slot={match.away} />
      </div>
    </div>
  );
}

function RoundColumn({ round, index }: { round: Round; index: number }) {
  const isFinal = round.shortName === "Final";
  return (
    <div
      className="flex flex-col gap-0 animate-in fade-in slide-in-from-right-4 fill-mode-both"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={cn(
        "text-center mb-4 pb-2 border-b border-border",
      )}>
        <div className={cn(
          "text-xs font-mono uppercase tracking-widest",
          isFinal ? "text-primary font-bold" : "text-muted-foreground",
        )}>
          {round.name}
        </div>
        <div className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{round.matches.length} match{round.matches.length !== 1 ? "es" : ""}</div>
      </div>

      <div className="flex flex-col flex-1 justify-around gap-2">
        {round.matches.map((match) => (
          <MatchCard key={match.id} match={match} size={isFinal ? "lg" : "md"} />
        ))}
      </div>
    </div>
  );
}

export default function Knockout() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">
            Knockout <span className="text-primary">Bracket</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">
            Road to the World Cup Final · MetLife Stadium, New York · Jul 19
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border rounded-md px-3 py-2 bg-card">
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <span className="text-primary font-bold">Group stage in progress</span>
          <span>· Slots fill from Jun 28</span>
        </div>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-bold">1A</span>
          <span>= Group winner / runner-up / 3rd place</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/40 font-bold">TBD</span>
          <span>= Winner of previous round</span>
        </div>
      </div>

      {/* Bracket — horizontal scroll */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="grid gap-4 min-w-[960px]" style={{ gridTemplateColumns: `repeat(${rounds.length}, 1fr)` }}>
          {rounds.map((round, i) => (
            <RoundColumn key={round.shortName} round={round} index={i} />
          ))}
        </div>
      </div>

      {/* Third place / Final callout */}
      <div className="border-t border-border pt-8 grid md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Third Place Play-off · Jul 18 · Miami</div>
          <MatchCard match={thirdPlace} />
        </div>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-3">
            <Trophy className="w-3.5 h-3.5" />
            World Cup Final · Jul 19 · MetLife Stadium, New York
          </div>
          <div className="bg-card border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(232,25,60,0.1)]">
            <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-primary">Champion</span>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="px-4 py-6 flex flex-col items-center gap-1 text-center">
              <div className="text-4xl font-black text-muted-foreground/20 font-mono">?</div>
              <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider mt-2">To be determined</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule timeline */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-black uppercase tracking-tight mb-4">Tournament Timeline</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { phase: "Group Stage", dates: "Jun 11–26", teams: "48", color: "border-muted-foreground/30 text-muted-foreground" },
            { phase: "Round of 32", dates: "Jun 28–Jul 3", teams: "32", color: "border-blue-500/40 text-blue-400" },
            { phase: "Round of 16", dates: "Jul 4–7", teams: "16", color: "border-violet-500/40 text-violet-400" },
            { phase: "Quarter-finals", dates: "Jul 9–11", teams: "8", color: "border-orange-500/40 text-orange-400" },
            { phase: "Semi-finals", dates: "Jul 14–15", teams: "4", color: "border-red-500/40 text-red-400" },
            { phase: "Final", dates: "Jul 19", teams: "2", color: "border-primary/60 text-primary" },
          ].map((p, i) => (
            <div
              key={p.phase}
              className={cn("border rounded-lg p-3 bg-card animate-in fade-in zoom-in-95 fill-mode-both", p.color)}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={cn("font-black text-2xl font-mono", p.color.split(" ")[1])}>{p.teams}</div>
              <div className="text-xs font-bold uppercase tracking-tight mt-1">{p.phase}</div>
              <div className="text-xs font-mono text-muted-foreground mt-0.5">{p.dates}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
