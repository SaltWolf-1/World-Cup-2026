import { useState } from "react";
import { useListTeams, useFollowTeam, useUnfollowTeam } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Teams() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useListTeams();
  const followTeam = useFollowTeam();
  const unfollowTeam = useUnfollowTeam();

  const handleToggleFollow = (e: React.MouseEvent, teamId: number, isFollowed: boolean) => {
    e.preventDefault(); // Prevent link click
    if (isFollowed) {
      unfollowTeam.mutate({ id: teamId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
          queryClient.invalidateQueries({ queryKey: ["/api/teams/followed"] });
        }
      });
    } else {
      followTeam.mutate({ id: teamId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
          queryClient.invalidateQueries({ queryKey: ["/api/teams/followed"] });
        }
      });
    }
  };

  const filteredTeams = teams
    ?.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">Tournament <span className="text-primary">Teams</span></h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">All 48 qualified nations</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search teams..." 
            className="pl-9 font-mono bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : filteredTeams?.map((team, i) => (
          <Link key={team.id} href={`/teams/${team.id}`}>
            <div 
              className="group bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${Math.min(i * 30, 800)}ms` }}
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-2 right-2 w-8 h-8 rounded-full z-10 transition-colors hover:bg-background/50",
                  team.isFollowed ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
                onClick={(e) => handleToggleFollow(e, team.id, !!team.isFollowed)}
                disabled={followTeam.isPending || unfollowTeam.isPending}
              >
                <Star className={cn("w-4 h-4", team.isFollowed && "fill-current")} />
              </Button>
              
              <img
                src={`https://flagcdn.com/w80/${team.flagCode}.png`}
                alt={team.name}
                className="w-16 h-11 object-cover mx-auto mb-4 rounded shadow-md group-hover:scale-110 transition-transform duration-300"
              />
              <h3 className="font-bold uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{team.name}</h3>
              <p className="text-xs font-mono text-muted-foreground mt-1 uppercase">Group {team.group}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
