import { useState } from "react";
import { useListMatches, ListMatchesStatus } from "@workspace/api-client-react";
import { MatchCard } from "@/components/match-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function Matches() {
  const [status, setStatus] = useState<ListMatchesStatus | "all">("all");
  const [group, setGroup] = useState<string>("all");

  const { data: matches, isLoading } = useListMatches({
    status: status === "all" ? undefined : status,
    group: group === "all" ? undefined : group,
  }, { query: { refetchInterval: 30000 } });

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
