import { useState, useEffect } from "react";
import { useListMatches, ListMatchesStatus } from "@workspace/api-client-react";
import { MatchCard } from "@/components/match-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const REFRESH_OPTIONS = [
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "2 min", value: 120_000 },
];

function useTimeAgo(ts: number | null) {
  const [label, setLabel] = useState("–");
  useEffect(() => {
    if (!ts) return;
    const update = () => {
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 5) setLabel("just now");
      else if (diff < 60) setLabel(`${diff}s ago`);
      else setLabel(`${Math.floor(diff / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 5_000);
    return () => clearInterval(id);
  }, [ts]);
  return label;
}

export default function Matches() {
  const [status, setStatus] = useState<ListMatchesStatus | "all">("all");
  const [group, setGroup] = useState<string>("all");
  const [refreshInterval, setRefreshInterval] = useState(30_000);

  const { data: matches, isLoading, dataUpdatedAt, refetch, isFetching } = useListMatches({
    status: status === "all" ? undefined : status,
    group: group === "all" ? undefined : group,
  }, { query: { refetchInterval: refreshInterval } });

  const timeAgo = useTimeAgo(dataUpdatedAt || null);
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">Match <span className="text-primary">Schedule</span></h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">Full tournament fixtures</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-[140px] font-mono uppercase text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="live">Live Now</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-[140px] font-mono uppercase text-xs">
              <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map(g => (
                <SelectItem key={g} value={g}>Group {g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Refresh Controls */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border">
        <div className="flex items-center gap-2">
          <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isFetching && "animate-spin text-primary")} />
          <span className="text-xs font-mono text-muted-foreground">
            Updated <span className="text-foreground">{timeAgo}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">Auto:</span>
          {REFRESH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRefreshInterval(opt.value)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all",
                refreshInterval === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => refetch()}
            className="ml-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            Now
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : matches && matches.length > 0 ? (
          matches.map((match, i) => (
            <div key={match.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${Math.min(i * 50, 1000)}ms` }}>
              <MatchCard match={match} />
            </div>
          ))
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground border-dashed flex flex-col items-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-mono uppercase tracking-wider text-lg">No matches found</p>
            <p className="text-sm mt-2">Adjust your filters to see more results</p>
            <Button
              variant="outline"
              className="mt-6 font-mono uppercase tracking-wider text-xs"
              onClick={() => { setStatus("all"); setGroup("all"); }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
