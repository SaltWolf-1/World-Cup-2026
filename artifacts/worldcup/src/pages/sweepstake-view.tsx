import { useParams } from "wouter";
import { useGetSweepstake } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Award, Star, Calendar, AlertTriangle } from "lucide-react";

const PLAYER_COLORS = [
  "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  "from-rose-500/20 to-rose-500/5 border-rose-500/30",
  "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
  "from-teal-500/20 to-teal-500/5 border-teal-500/30",
  "from-lime-500/20 to-lime-500/5 border-lime-500/30",
  "from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30",
  "from-red-500/20 to-red-500/5 border-red-500/30",
  "from-sky-500/20 to-sky-500/5 border-sky-500/30",
  "from-green-500/20 to-green-500/5 border-green-500/30",
  "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
];

const ACCENT_TEXT = [
  "text-violet-400", "text-blue-400", "text-emerald-400", "text-orange-400",
  "text-rose-400", "text-cyan-400", "text-amber-400", "text-pink-400",
  "text-indigo-400", "text-teal-400", "text-lime-400", "text-fuchsia-400",
  "text-red-400", "text-sky-400", "text-green-400", "text-yellow-400",
];

type Team = { id: number; name: string; flagCode: string; group: string; winChance: number };
type Assignment = { playerName: string; teams: Team[]; color: string };

function PlayerCard({ assignment, index }: { assignment: Assignment; index: number }) {
  const bestTeam = [...assignment.teams].sort((a, b) => b.winChance - a.winChance)[0];
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 space-y-3 animate-in fade-in zoom-in-95 fill-mode-both shadow-sm",
        color,
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center font-black text-lg",
          ACCENT_TEXT[index % ACCENT_TEXT.length],
        )}>
          {assignment.playerName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-base tracking-tight truncate">{assignment.playerName}</div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {assignment.teams.length} team{assignment.teams.length !== 1 ? "s" : ""}
          </div>
        </div>
        {bestTeam && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-mono text-muted-foreground">{bestTeam.winChance}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {assignment.teams.map((team, ti) => (
          <div
            key={team.id}
            className="flex items-center gap-3 bg-background/40 rounded-xl px-3 py-2.5 animate-in fade-in slide-in-from-left-4 fill-mode-both"
            style={{ animationDelay: `${index * 60 + ti * 80}ms` }}
          >
            <img
              src={`https://flagcdn.com/w40/${team.flagCode}.png`}
              className="w-7 h-auto rounded-sm shrink-0 shadow-sm"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{team.name}</div>
              <div className="text-[10px] font-mono text-muted-foreground">Group {team.group}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-black font-mono text-muted-foreground">{team.winChance}%</div>
              <div className="text-[10px] font-mono text-muted-foreground/50">to win</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SweepstakeView() {
  const { gameId } = useParams<{ gameId: string }>();
  const { data, isLoading, isError } = useGetSweepstake(gameId ?? "");

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-500">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-xl font-black uppercase">Sweepstake Not Found</h2>
        <p className="text-muted-foreground font-mono text-sm text-center">
          The game ID <span className="text-foreground font-bold">{gameId}</span> doesn't exist or may have been removed.
        </p>
      </div>
    );
  }

  const assignments = data.assignments as Assignment[];
  const createdAt = new Date(data.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" /> Saved {createdAt}
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">
          Sweepstake <span className="text-primary">Results</span>
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">
          {data.stage} · {assignments.length} players · Game <span className="text-foreground font-bold">{gameId}</span>
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a, i) => (
          <PlayerCard key={i} assignment={a} index={i} />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Favourites Ranking</span>
        </div>
        <div className="space-y-2">
          {[...assignments]
            .map((a) => ({
              ...a,
              topWin: Math.max(...a.teams.map((t) => t.winChance)),
              totalWin: a.teams.reduce((s, t) => s + t.winChance, 0),
            }))
            .sort((a, b) => b.topWin - a.topWin)
            .map((a, rank) => {
              const origIdx = assignments.findIndex((x) => x.playerName === a.playerName);
              return (
                <div key={a.playerName} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0",
                    rank === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    rank === 1 ? "bg-zinc-400/20 text-zinc-400" :
                    rank === 2 ? "bg-orange-700/20 text-orange-600" :
                    "text-muted-foreground",
                  )}>
                    {rank + 1}
                  </span>
                  <span className={cn("font-bold text-sm flex-1 truncate", ACCENT_TEXT[origIdx % ACCENT_TEXT.length])}>
                    {a.playerName}
                  </span>
                  <div className="flex items-center gap-1">
                    {a.teams.map((t) => (
                      <img
                        key={t.id}
                        src={`https://flagcdn.com/w20/${t.flagCode}.png`}
                        className="w-4 h-auto rounded-sm"
                        alt={t.name}
                        title={t.name}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    {a.totalWin.toFixed(1)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
