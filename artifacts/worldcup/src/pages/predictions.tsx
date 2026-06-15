import { useListPredictions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Activity } from "lucide-react";

export default function Predictions() {
  const { data: predictions, isLoading } = useListPredictions();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">Analytics & <span className="text-primary">Odds</span></h1>
        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" /> Live tournament probability engine
        </p>
      </header>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium w-16 text-center">Rank</th>
                  <th className="px-6 py-4 font-medium">Team</th>
                  <th className="px-6 py-4 font-medium text-center">Win %</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">To Final</th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">To Semi</th>
                  <th className="px-6 py-4 font-medium text-right">Power Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {predictions?.map((pred, idx) => (
                  <tr key={pred.team.id} className={`hover:bg-muted/30 transition-colors ${pred.eliminated ? 'opacity-40 grayscale' : ''}`}>
                    <td className="px-6 py-4 text-center font-mono font-bold text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/teams/${pred.team.id}`}>
                        <div className="flex items-center gap-3 cursor-pointer group w-max">
                          <img src={`https://flagcdn.com/w40/${pred.team.flagCode}.png`} alt="" className="w-6 h-auto rounded-sm group-hover:scale-110 transition-transform" />
                          <span className={`font-bold uppercase tracking-tight group-hover:text-primary transition-colors ${pred.eliminated ? 'line-through' : ''}`}>
                            {pred.team.name}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-center">
                        <span className="font-mono font-black text-lg text-primary w-12 text-right">{pred.winChance}%</span>
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-primary" style={{ width: `${pred.winChance}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-10">{pred.semifinalChance}%</span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${pred.semifinalChance}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-10">{pred.quarterFinalChance}%</span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-muted-foreground" style={{ width: `${pred.quarterFinalChance}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block bg-background border border-border px-3 py-1 rounded font-mono font-bold text-sm">
                        {pred.rating?.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
