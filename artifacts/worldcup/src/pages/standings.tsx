import { useState } from "react";
import { useListStandings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Standings() {
  const [group, setGroup] = useState<string>("all");
  
  const { data: standings, isLoading } = useListStandings({
    group: group === "all" ? undefined : group
  });

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">Group <span className="text-primary">Standings</span></h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">Road to the knockouts</p>
        </div>

        <div className="w-full md:w-48">
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-full font-mono uppercase text-sm">
              <SelectValue placeholder="Select Group" />
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

      {isLoading ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {standings?.map((standing, i) => (
            <div key={standing.group} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="font-black text-xl uppercase tracking-tight">Group {standing.group}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background/50 text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium w-8">#</th>
                      <th className="px-4 py-3 font-medium">Team</th>
                      <th className="px-3 py-3 font-medium text-center">P</th>
                      <th className="px-3 py-3 font-medium text-center">W</th>
                      <th className="px-3 py-3 font-medium text-center">D</th>
                      <th className="px-3 py-3 font-medium text-center">L</th>
                      <th className="px-3 py-3 font-medium text-center hidden sm:table-cell">GD</th>
                      <th className="px-4 py-3 font-bold text-center text-foreground">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {standing.entries.map((entry, idx) => {
                      // Top 2 usually advance directly
                      const advances = idx < 2;
                      const gd = entry.goalsFor - entry.goalsAgainst;
                      
                      return (
                        <tr key={entry.team.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-4 py-3">
                            <div className={cn(
                              "w-6 h-6 rounded-sm flex items-center justify-center font-mono font-bold text-xs",
                              advances ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground"
                            )}>
                              {idx + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/teams/${entry.team.id}`}>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <img src={`https://flagcdn.com/w20/${entry.team.flagCode}.png`} alt="" className="w-5 h-auto rounded-sm group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{entry.team.name}</span>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-center font-mono">{entry.played}</td>
                          <td className="px-3 py-3 text-center font-mono">{entry.wins}</td>
                          <td className="px-3 py-3 text-center font-mono">{entry.draws}</td>
                          <td className="px-3 py-3 text-center font-mono text-muted-foreground">{entry.losses}</td>
                          <td className="px-3 py-3 text-center font-mono hidden sm:table-cell text-muted-foreground">
                            {gd > 0 ? `+${gd}` : gd}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-black text-lg text-primary">{entry.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
