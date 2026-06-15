import { useParams } from "wouter";
import { useGetTeam, useFollowTeam, useUnfollowTeam } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/match-card";
import { Star, Trophy, Activity, Target, Shield, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamDetail() {
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useGetTeam(id, {
    query: { enabled: !!id, queryKey: ["getTeam", id] }
  });

  const followTeam = useFollowTeam();
  const unfollowTeam = useUnfollowTeam();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!team) return <div>Team not found</div>;

  const handleToggleFollow = () => {
    if (team.isFollowed) {
      unfollowTeam.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getTeam", id] })
      });
    } else {
      followTeam.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getTeam", id] })
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile */}
      <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none">
          <img src={`https://flagcdn.com/w320/${team.flagCode}.png`} alt="" className="w-96 blur-sm scale-150" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img 
              src={`https://flagcdn.com/w160/${team.flagCode}.png`} 
              alt={team.name} 
              className="w-24 md:w-32 h-auto rounded-md shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-mono uppercase tracking-wider rounded-sm">
                  Group {team.group}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight skew-x-[-5deg] drop-shadow-md">
                {team.name}
              </h1>
            </div>
          </div>
          
          <Button 
            size="lg" 
            variant={team.isFollowed ? "outline" : "default"}
            className={cn(
              "font-mono uppercase tracking-wider gap-2",
              team.isFollowed ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleToggleFollow}
            disabled={followTeam.isPending || unfollowTeam.isPending}
          >
            <Star className={cn("w-4 h-4", team.isFollowed && "fill-current")} />
            {team.isFollowed ? "Following" : "Follow Team"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatBox label="Points" value={team.points} icon={Trophy} highlight />
        <StatBox label="Played" value={team.played} icon={Activity} />
        <StatBox label="Wins" value={team.wins} icon={Activity} />
        <StatBox label="Draws" value={team.draws} icon={Activity} />
        <StatBox label="Goals For" value={team.goalsFor} icon={Target} />
        <StatBox label="Goals Agst" value={team.goalsAgainst} icon={Shield} />
      </div>

      {/* Advanced & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Tournament Analytics</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono uppercase text-sm text-muted-foreground flex items-center gap-2">
                    <Percent className="w-4 h-4" /> Win Probability
                  </span>
                  <span className="text-2xl font-black font-mono text-primary">{team.winChance}%</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${team.winChance}%` }} />
                </div>
              </div>
              
              <div className="pt-6 border-t border-border">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-mono uppercase text-sm text-muted-foreground">Goal Difference</span>
                  <span className="text-2xl font-black font-mono">
                    {team.goalsFor !== undefined && team.goalsAgainst !== undefined 
                      ? (team.goalsFor - team.goalsAgainst > 0 ? '+' : '') + (team.goalsFor - team.goalsAgainst)
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Recent & Upcoming Matches</h2>
          <div className="grid gap-4">
            {team.recentMatches && team.recentMatches.length > 0 ? (
              team.recentMatches.map((match) => (
                <MatchCard key={match.id} match={match} compact />
              ))
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground font-mono uppercase text-sm">
                No match history available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, highlight }: { label: string, value: any, icon: any, highlight?: boolean }) {
  return (
    <div className={cn(
      "bg-card border rounded-xl p-4 flex flex-col items-center justify-center text-center",
      highlight ? "border-primary bg-primary/5" : "border-border"
    )}>
      <Icon className={cn("w-5 h-5 mb-2 opacity-50", highlight && "text-primary opacity-100")} />
      <span className={cn("text-3xl font-black font-mono tracking-tighter", highlight && "text-primary")}>
        {value ?? 0}
      </span>
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}
