import { useListHighlights } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MonitorPlay, Play } from "lucide-react";

export default function Highlights() {
  const { data: highlights, isLoading } = useListHighlights();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg] text-primary flex items-center gap-3">
          <MonitorPlay className="w-8 h-8" /> Action Feed
        </h1>
        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">Key moments across all matches</p>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : highlights && highlights.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((hl, i) => (
            <div key={hl.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
              {/* Fake video thumbnail placeholder */}
              <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-tr from-background/80 to-transparent z-10" />
                
                {/* Decorative noise/pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent" />
                
                <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur border border-white/10 flex items-center justify-center z-20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Play className="w-5 h-5 ml-1" />
                </div>

                <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                  <span className="bg-black/80 backdrop-blur text-white text-xs font-mono px-2 py-1 rounded font-bold uppercase tracking-wider border border-white/10">
                    {hl.type.replace('_', ' ')}
                  </span>
                  <span className="bg-primary text-primary-foreground text-xs font-mono px-2 py-1 rounded font-bold border border-primary-foreground/20">
                    {hl.minute}'
                  </span>
                </div>
              </div>

              <div className="p-5">
                <p className="font-bold text-lg leading-tight mb-2 line-clamp-2">{hl.description}</p>
                {hl.playerName && (
                  <p className="text-primary font-mono text-sm uppercase tracking-wider mb-4">{hl.playerName}</p>
                )}
                
                <Link href={`/matches/${hl.matchId}`}>
                  <span className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-t border-border pt-4 mt-auto block flex items-center justify-between">
                    Go to Match Center <span>→</span>
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground border-dashed">
          <MonitorPlay className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-mono uppercase tracking-wider text-lg">No highlights available yet</p>
        </div>
      )}
    </div>
  );
}
