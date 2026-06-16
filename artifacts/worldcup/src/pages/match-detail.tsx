import { useParams } from "wouter";
import { useGetMatch } from "@workspace/api-client-react";
import { formatMatchTime, formatMinute } from "@/lib/formatters";
import { LivePulse } from "@/components/live-pulse";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Activity, Clock, MapPin, Flag, AlertTriangle } from "lucide-react";

export default function MatchDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: match, isLoading } = useGetMatch(id, { 
    query: { 
      enabled: !!id, 
      queryKey: ["getMatch", id],
      refetchInterval: 30000 
    } 
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!match) {
    return <div className="p-8 text-center text-muted-foreground font-mono uppercase">Match not found</div>;
  }

  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";

  // Sort events newest first
  const sortedEvents = [...(match.events || [])].sort((a, b) => b.minute - a.minute);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Match Header Scoreboard */}
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-6",
        isLive && "border-destructive/50 shadow-[0_0_30px_rgba(255,0,0,0.15)]"
      )}>
        {/* Background glow based on team colors could go here, for now just a gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.venue || "TBD"}</span>
            <span>•</span>
            <span>{match.group ? `Group ${match.group}` : match.stage}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatMatchTime(match.kickoffTime)}</span>
          </div>

          <div className="w-full flex items-center justify-between max-w-4xl mx-auto">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 gap-3">
              <img
                src={`https://flagcdn.com/w160/${match.homeTeam.flagCode}.png`}
                alt={`${match.homeTeam.name} flag`}
                className="w-16 md:w-24 h-10 md:h-16 object-cover rounded-md shadow-lg"
              />
              <span className="font-black text-lg md:text-2xl text-center uppercase tracking-tight skew-x-[-5deg]">{match.homeTeam.name}</span>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 px-4 md:px-12 text-center flex flex-col items-center justify-center">
              {isLive && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full border border-destructive/20">
                    <span className="font-bold font-mono">{formatMinute(match.minute)}</span>
                    <LivePulse />
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <div className="mb-4 text-sm font-mono uppercase tracking-wider text-muted-foreground bg-muted/50 px-4 py-1 rounded-full">
                  Full Time
                </div>
              )}

              {(isLive || isCompleted) ? (
                <div className="font-mono text-4xl md:text-6xl font-black tracking-tighter flex items-center gap-4 md:gap-8 drop-shadow-md">
                  <span className={cn(match.homeScore! > match.awayScore! && "text-primary")}>{match.homeScore}</span>
                  <span className="text-muted-foreground/20">-</span>
                  <span className={cn(match.awayScore! > match.homeScore! && "text-primary")}>{match.awayScore}</span>
                </div>
              ) : (
                <div className="font-mono text-3xl md:text-4xl font-black tracking-tighter text-muted-foreground/30">
                  vs
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 gap-3">
              <img
                src={`https://flagcdn.com/w160/${match.awayTeam.flagCode}.png`}
                alt={`${match.awayTeam.name} flag`}
                className="w-16 md:w-24 h-10 md:h-16 object-cover rounded-md shadow-lg"
              />
              <span className="font-black text-lg md:text-2xl text-center uppercase tracking-tight skew-x-[-5deg]">{match.awayTeam.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Timeline */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Match Timeline
          </h3>
          
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            {sortedEvents.length > 0 ? (
              <div className="relative border-l-2 border-border/50 ml-4 space-y-8 pb-4">
                {sortedEvents.map((event) => (
                  <div key={event.id} className="relative pl-6">
                    {/* Event Dot/Icon */}
                    <div className="absolute -left-[21px] top-1 bg-card border-2 border-primary w-10 h-10 rounded-full flex items-center justify-center">
                      <EventIcon type={event.type} />
                    </div>
                    
                    <div className="bg-muted/30 border border-border rounded-lg p-4 ml-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-bold text-primary">{event.minute}'</span>
                        <span className="text-sm font-mono uppercase tracking-wider text-muted-foreground border-l border-border pl-3">
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-medium text-lg">{event.description}</p>
                      {event.playerName && (
                        <p className="text-muted-foreground mt-1 text-sm">{event.playerName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-mono uppercase tracking-wider">No events recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case 'goal': return <div className="w-4 h-4 rounded-full bg-primary" />;
    case 'yellow_card': return <div className="w-3 h-4 bg-yellow-400 rounded-sm skew-x-[-10deg]" />;
    case 'red_card': return <div className="w-3 h-4 bg-destructive rounded-sm skew-x-[-10deg]" />;
    case 'substitution': return <Activity className="w-4 h-4" />;
    case 'var': return <MonitorPlay className="w-4 h-4" />;
    case 'penalty': return <div className="w-4 h-4 rounded-full border-2 border-primary" />;
    case 'kickoff':
    case 'halftime':
    case 'fulltime': return <Clock className="w-4 h-4" />;
    default: return <Flag className="w-4 h-4" />;
  }
}
