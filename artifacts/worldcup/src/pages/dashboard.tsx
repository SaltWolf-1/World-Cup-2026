import { useGetDashboardSummary, useGetLiveMatches, useGetTodayMatches } from "@workspace/api-client-react";
import { MatchCard } from "@/components/match-card";
import { Activity, Goal, Users, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary({
    query: { refetchInterval: 30000 }
  });

  const { data: liveMatches, isLoading: isLiveLoading } = useGetLiveMatches({
    query: { refetchInterval: 30000 }
  });

  const { data: todayMatches, isLoading: isTodayLoading } = useGetTodayMatches();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">Live <span className="text-primary">Center</span></h1>
        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">Real-time tournament telemetry</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Live Now" 
          value={summary?.liveMatchCount.toString()} 
          icon={Activity} 
          loading={isSummaryLoading}
          highlight={summary?.liveMatchCount ? summary.liveMatchCount > 0 : false}
        />
        <StatCard 
          title="Matches Today" 
          value={summary?.todayMatchCount.toString()} 
          icon={Zap} 
          loading={isSummaryLoading} 
        />
        <StatCard 
          title="Goals Today" 
          value={summary?.totalGoalsToday.toString()} 
          icon={Goal} 
          loading={isSummaryLoading} 
        />
        <StatCard 
          title="Followed Playing" 
          value={summary?.followedTeamsPlaying.length.toString()} 
          icon={Users} 
          loading={isSummaryLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Live Matches */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                Live Matches
              </h2>
            </div>
            
            {isLiveLoading ? (
              <div className="grid gap-4"><Skeleton className="h-32 w-full" /></div>
            ) : liveMatches && liveMatches.length > 0 ? (
              <div className="grid gap-4">
                {liveMatches.map((match, i) => (
                  <div key={match.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
                    <MatchCard match={match} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground border-dashed">
                <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="font-mono uppercase tracking-wider">No live matches at the moment.</p>
              </div>
            )}
          </section>

          {/* Today's Schedule */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Today's Schedule</h2>
              <Link href="/matches" className="text-primary text-sm font-bold uppercase hover:underline">View All</Link>
            </div>
            
            {isTodayLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
            ) : todayMatches && todayMatches.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {todayMatches.filter(m => m.status !== "live").map((match, i) => (
                  <div key={match.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${(i+liveMatches?.length!) * 100}ms` }}>
                    <MatchCard match={match} compact />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground border-dashed">
                <p className="font-mono uppercase tracking-wider">No more matches today.</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {/* Golden Boot Race */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-primary">Golden Boot Race</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {isSummaryLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : summary?.topScorers && summary.topScorers.length > 0 ? (
                <div className="divide-y divide-border">
                  {summary.topScorers.map((scorer, idx) => (
                    <div key={`${scorer.playerName}-${scorer.teamId}`} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 text-center font-mono text-muted-foreground font-bold">{idx + 1}</div>
                        {scorer.flagCode && (
                          <img src={`https://flagcdn.com/w40/${scorer.flagCode}.png`} alt={scorer.teamName} className="w-6 h-auto rounded-sm" />
                        )}
                        <div>
                          <p className="font-bold leading-none">{scorer.playerName}</p>
                          <p className="text-xs text-muted-foreground">{scorer.teamName}</p>
                        </div>
                      </div>
                      <div className="font-mono font-black text-lg text-primary">{scorer.goals}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm font-mono uppercase">
                  No data available yet
                </div>
              )}
            </div>
          </section>

          {/* Followed Teams Status */}
          {summary?.followedTeamsPlaying && summary.followedTeamsPlaying.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Followed Teams Playing</h2>
              <div className="bg-card border border-primary/30 rounded-lg p-4 shadow-[0_0_15px_rgba(232,25,60,0.05)]">
                <div className="flex flex-wrap gap-2">
                  {summary.followedTeamsPlaying.map(team => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-full hover:border-primary transition-colors cursor-pointer">
                        <img src={`https://flagcdn.com/w40/${team.flagCode}.png`} alt={team.name} className="w-5 h-auto rounded-sm" />
                        <span className="text-sm font-bold">{team.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, highlight = false }: { title: string, value?: string, icon: any, loading: boolean, highlight?: boolean }) {
  return (
    <div className={`bg-card border rounded-lg p-4 md:p-6 transition-all ${highlight ? 'border-primary shadow-[0_0_15px_rgba(232,25,60,0.1)]' : 'border-border'}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-primary' : ''}`} />
        <h3 className="text-xs font-mono uppercase tracking-wider">{title}</h3>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <div className={`text-3xl md:text-4xl font-black font-mono tracking-tighter ${highlight ? 'text-primary' : ''}`}>
            {value || "0"}
          </div>
        )}
      </div>
    </div>
  );
}
