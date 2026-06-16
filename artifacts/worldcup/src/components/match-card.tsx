import { Link } from "wouter";
import { Match, MatchStatus } from "@workspace/api-client-react";
import { formatMatchTime, formatMinute } from "@/lib/formatters";
import { LivePulse } from "./live-pulse";
import { cn } from "@/lib/utils";

export function MatchCard({ match, compact = false }: { match: Match, compact?: boolean }) {
  const isLive = match.status === "live";
  const isCompleted = match.status === "completed";
  
  return (
    <Link href={`/matches/${match.id}`}>
      <div className={cn(
        "group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(232,25,60,0.1)] cursor-pointer flex flex-col",
        isLive && "border-destructive/50 shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:border-destructive hover:shadow-[0_0_25px_rgba(255,0,0,0.2)]"
      )}>
        {/* Status Bar */}
        <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between text-xs font-mono uppercase tracking-wider">
          <div className="flex items-center gap-2 text-muted-foreground">
            {match.group ? `Group ${match.group}` : match.stage}
          </div>
          <div>
            {isLive ? (
              <div className="flex items-center gap-2">
                <span className="text-destructive font-bold">{formatMinute(match.minute)}</span>
                <LivePulse />
              </div>
            ) : isCompleted ? (
              <span className="text-muted-foreground">FT</span>
            ) : (
              <span className="text-muted-foreground">{formatMatchTime(match.kickoffTime)}</span>
            )}
          </div>
        </div>

        {/* Teams & Score */}
        <div className={cn("p-4 md:p-6 flex items-center justify-between", compact ? "py-4" : "")}>
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1 gap-2">
            <img 
              src={`https://flagcdn.com/w40/${match.homeTeam.flagCode}.png`}
              alt={`${match.homeTeam.name} flag`}
              className="w-10 h-7 object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-center leading-tight">{match.homeTeam.name}</span>
          </div>

          {/* Scoreline */}
          <div className="flex-shrink-0 px-4 md:px-8 text-center flex flex-col items-center justify-center">
            {(isLive || isCompleted) ? (
              <div className="flex items-center gap-3 font-mono text-3xl md:text-5xl font-black tracking-tighter">
                <span className={cn(match.homeScore! > match.awayScore! && "text-primary")}>{match.homeScore}</span>
                <span className="text-muted-foreground/30 text-xl">-</span>
                <span className={cn(match.awayScore! > match.homeScore! && "text-primary")}>{match.awayScore}</span>
              </div>
            ) : (
              <div className="font-mono text-xl md:text-2xl font-bold text-muted-foreground">
                vs
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center flex-1 gap-2">
            <img 
              src={`https://flagcdn.com/w40/${match.awayTeam.flagCode}.png`}
              alt={`${match.awayTeam.name} flag`}
              className="w-10 h-7 object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform"
            />
            <span className="font-bold text-center leading-tight">{match.awayTeam.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
