import { useState, useCallback } from "react";
import { useListPredictions, useCreateSweepstake } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Shuffle, Users, Trophy, ChevronRight, ChevronLeft,
  RotateCcw, Pencil, Check, Star, Zap, Award, Link2, Copy,
  Loader2,
} from "lucide-react";

const STAGE_OPTIONS = [
  { label: "Group Stage",    teams: 48, description: "All 48 teams in the tournament" },
  { label: "Round of 32",   teams: 32, description: "Top 32 teams by power rating" },
  { label: "Round of 16",   teams: 16, description: "Top 16 teams by power rating" },
  { label: "Quarter-finals", teams: 8, description: "Top 8 teams by power rating" },
  { label: "Semi-finals",    teams: 4, description: "Top 4 teams by power rating" },
  { label: "Final",          teams: 2, description: "The top 2 favourites only" },
];

type Team = {
  id: number;
  name: string;
  flagCode: string;
  group: string;
  winChance: number;
  rating?: number;
};

type Assignment = {
  playerName: string;
  teams: Team[];
  color: string;
};

const PLAYER_COLORS = [
  "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  "from-orange-500/20 to-orange-500/5 border-orange-500/30",
  "from-rose-500/20 to-rose-500/5 border-rose-500/30",
  "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  "from-pink-500/20 to-pink-500/5 border-pink-500/30",
  "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
  "from-teal-500/20 to-teal-500/5 border-teal-500/30",
  "from-lime-500/20 to-lime-500/5 border-lime-500/30",
  "from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30",
  "from-red-500/20 to-red-500/5 border-red-500/30",
  "from-sky-500/20 to-sky-500/5 border-sky-500/30",
  "from-green-500/20 to-green-500/5 border-green-500/30",
  "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
];

const ACCENT_TEXT = [
  "text-violet-400", "text-blue-400", "text-emerald-400", "text-orange-400",
  "text-rose-400", "text-cyan-400", "text-amber-400", "text-pink-400",
  "text-indigo-400", "text-teal-400", "text-lime-400", "text-fuchsia-400",
  "text-red-400", "text-sky-400", "text-green-400", "text-yellow-400",
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildAssignments(
  players: string[],
  pool: Team[],
  teamsPerPlayer: number,
): Assignment[] {
  const n = players.length;

  // Split pool into `teamsPerPlayer` tiers of size `n`, shuffle each tier
  // independently, then deal one team per tier to each player.
  // Result: each player gets one team from every power-band, keeping the
  // draw random while evening out average favourability.
  const tiers: Team[][] = [];
  for (let t = 0; t < teamsPerPlayer; t++) {
    tiers.push(shuffle(pool.slice(t * n, (t + 1) * n)));
  }

  return players.map((name, i) => ({
    playerName: name,
    teams: tiers.map((tier) => tier[i]),
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }));
}

// ─── Step indicators ───────────────────────────────────────────────────────────

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-300",
      done ? "bg-primary border-primary text-primary-foreground" :
      active ? "border-primary text-primary bg-primary/10 shadow-[0_0_10px_rgba(232,25,60,0.3)]" :
      "border-border text-muted-foreground",
    )}>
      {done ? <Check className="w-4 h-4" /> : n}
    </div>
  );
}

function Steps({ current }: { current: number }) {
  const labels = ["Configure", "Add Players", "Draw!"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <StepDot n={i + 1} active={current === i} done={current > i} />
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-widest hidden sm:block",
              current === i ? "text-primary" : current > i ? "text-primary/60" : "text-muted-foreground/40"
            )}>{label}</span>
          </div>
          {i < labels.length - 1 && (
            <div className={cn(
              "h-px w-8 sm:w-16 mx-1 sm:mx-2 mb-4 transition-all duration-500",
              current > i ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Configure ────────────────────────────────────────────────────────

function ConfigureStep({
  numPlayers, setNumPlayers,
  stageIdx, setStageIdx,
  teamsPerPlayer, poolSize,
  onNext,
  loading,
}: {
  numPlayers: number;
  setNumPlayers: (n: number) => void;
  stageIdx: number;
  setStageIdx: (i: number) => void;
  teamsPerPlayer: number;
  poolSize: number;
  onNext: () => void;
  loading: boolean;
}) {
  const stage = STAGE_OPTIONS[stageIdx];
  const tooManyPlayers = numPlayers > stage.teams;
  const valid = numPlayers >= 2 && !tooManyPlayers && teamsPerPlayer >= 1;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Configure <span className="text-primary">Sweepstake</span></h2>
        <p className="text-muted-foreground text-sm mt-1 font-mono">Set up your draw — teams are seeded by power rating</p>
      </div>

      {/* Players */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Users className="w-3.5 h-3.5" /> Number of Players
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min={2}
            max={48}
            value={numPlayers}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) setNumPlayers(Math.max(2, Math.min(48, v)));
            }}
            className="w-24 bg-card border border-border rounded-lg px-4 py-3 text-2xl font-black font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <div className="flex-1">
            <input
              type="range"
              min={2}
              max={Math.min(48, stage.teams)}
              value={numPlayers}
              onChange={(e) => setNumPlayers(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40 mt-1">
              <span>2</span>
              <span>{Math.min(48, stage.teams)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" /> Starting Stage
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STAGE_OPTIONS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => {
                setStageIdx(i);
                if (numPlayers > s.teams) setNumPlayers(s.teams);
              }}
              className={cn(
                "flex flex-col items-start gap-1 px-4 py-3 rounded-xl border text-left transition-all duration-200",
                stageIdx === i
                  ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(232,25,60,0.15)]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
              )}
            >
              <span className={cn("text-lg font-black font-mono tabular-nums", stageIdx === i ? "text-primary" : "text-foreground")}>
                {s.teams}
              </span>
              <span className="text-xs font-bold uppercase tracking-tight leading-tight">{s.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-mono">{stage.description}</p>
      </div>

      {/* Summary */}
      {!tooManyPlayers && numPlayers >= 2 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2 animate-in fade-in duration-300">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Draw Summary</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-primary font-mono">{numPlayers}</div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Players</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono">{teamsPerPlayer}</div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Teams each</div>
            </div>
            <div>
              <div className="text-2xl font-black font-mono">{poolSize}</div>
              <div className="text-[10px] font-mono uppercase text-muted-foreground">Teams drawn</div>
            </div>
          </div>
          {stage.teams - poolSize > 0 && (
            <p className="text-[10px] font-mono text-muted-foreground/50 text-center pt-1">
              {stage.teams - poolSize} lowest-ranked {stage.teams - poolSize === 1 ? "team" : "teams"} excluded for equal distribution
            </p>
          )}
        </div>
      )}

      {tooManyPlayers && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-mono">
          Only {stage.teams} teams at this stage — reduce player count or pick an earlier stage.
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!valid || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-all duration-200",
          valid && !loading
            ? "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(232,25,60,0.2)] active:scale-98"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {loading ? "Loading teams…" : "Next: Add Players"}
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2: Player Names ─────────────────────────────────────────────────────

function PlayersStep({
  players, setPlayers,
  onBack, onDraw,
}: {
  players: string[];
  setPlayers: (p: string[]) => void;
  onBack: () => void;
  onDraw: () => void;
}) {
  const updateName = (i: number, val: string) => {
    const next = [...players];
    next[i] = val;
    setPlayers(next);
  };

  const allNamed = players.every((p) => p.trim().length > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          Name Your <span className="text-primary">Players</span>
        </h2>
        <p className="text-muted-foreground text-sm mt-1 font-mono">Add names or initials — leave as default if you like</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {players.map((name, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-gradient-to-br",
              PLAYER_COLORS[i % PLAYER_COLORS.length],
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 bg-background/60",
              ACCENT_TEXT[i % ACCENT_TEXT.length],
            )}>
              {i + 1}
            </div>
            <input
              type="text"
              value={name}
              maxLength={20}
              placeholder={`Player ${i + 1}`}
              onChange={(e) => updateName(i, e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-muted-foreground/40 min-w-0"
            />
            <Pencil className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onDraw}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-sm hover:brightness-110 shadow-[0_0_20px_rgba(232,25,60,0.2)] active:scale-98 transition-all"
        >
          <Shuffle className="w-4 h-4" />
          Draw Teams!
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Results ──────────────────────────────────────────────────────────

function ShareBar({
  isSaving, savedGameId, onSave,
}: {
  isSaving: boolean;
  savedGameId: string | null;
  onSave: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = savedGameId
    ? `${window.location.origin}/s/${savedGameId}`
    : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (shareUrl) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5 animate-in fade-in duration-300">
        <Link2 className="w-4 h-4 text-primary shrink-0" />
        <span className="font-mono text-xs text-foreground/80 flex-1 truncate">{shareUrl}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0 hover:brightness-110 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSave}
      disabled={isSaving}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-xs hover:brightness-110 shadow-[0_0_16px_rgba(232,25,60,0.2)] active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSaving
        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
        : <><Link2 className="w-3.5 h-3.5" /> Save & Share</>
      }
    </button>
  );
}

function ResultsStep({
  assignments,
  stage,
  onRedraw,
  onReset,
  onSave,
  isSaving,
  savedGameId,
}: {
  assignments: Assignment[];
  stage: string;
  onRedraw: () => void;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  savedGameId: string | null;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-1 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Draw complete
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">
            Sweepstake <span className="text-primary">Results</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{stage} · {assignments.length} players</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={onRedraw}
            disabled={!!savedGameId}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title={savedGameId ? "Can't redraw after saving" : undefined}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Redraw
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            New Sweepstake
          </button>
        </div>
      </div>

      <ShareBar isSaving={isSaving} savedGameId={savedGameId} onSave={onSave} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a, i) => (
          <PlayerCard key={i} assignment={a} index={i} />
        ))}
      </div>

      {/* Leaderboard hint */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Favourites Ranking</span>
        </div>
        <div className="space-y-2">
          {[...assignments]
            .map((a) => ({
              ...a,
              topWin: Math.max(...a.teams.map((t) => t.winChance)),
              totalWin: a.teams.reduce((s, t) => s + t.winChance, 0),
            }))
            .sort((a, b) => b.topWin - a.topWin)
            .map((a, rank) => {
              const origIdx = assignments.findIndex((x) => x.playerName === a.playerName);
              return (
                <div key={a.playerName} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0",
                    rank === 0 ? "bg-yellow-500/20 text-yellow-400" :
                    rank === 1 ? "bg-zinc-400/20 text-zinc-400" :
                    rank === 2 ? "bg-orange-700/20 text-orange-600" :
                    "text-muted-foreground",
                  )}>
                    {rank + 1}
                  </span>
                  <span className={cn("font-bold text-sm flex-1 truncate", ACCENT_TEXT[origIdx % ACCENT_TEXT.length])}>
                    {a.playerName}
                  </span>
                  <div className="flex items-center gap-1">
                    {a.teams.map((t) => (
                      <img
                        key={t.id}
                        src={`https://flagcdn.com/w20/${t.flagCode}.png`}
                        className="w-4 h-auto rounded-sm"
                        alt={t.name}
                        title={t.name}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    {a.totalWin.toFixed(1)}%
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ assignment, index }: { assignment: Assignment; index: number }) {
  const bestTeam = [...assignment.teams].sort((a, b) => b.winChance - a.winChance)[0];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-4 space-y-3 animate-in fade-in zoom-in-95 fill-mode-both shadow-sm",
        assignment.color,
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Player header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center font-black text-lg",
          ACCENT_TEXT[index % ACCENT_TEXT.length],
        )}>
          {assignment.playerName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-base tracking-tight truncate">{assignment.playerName}</div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {assignment.teams.length} team{assignment.teams.length !== 1 ? "s" : ""}
          </div>
        </div>
        {bestTeam && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-mono text-muted-foreground">{bestTeam.winChance}%</span>
          </div>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {assignment.teams.map((team, ti) => (
          <div
            key={team.id}
            className="flex items-center gap-3 bg-background/40 rounded-xl px-3 py-2.5 animate-in fade-in slide-in-from-left-4 fill-mode-both"
            style={{ animationDelay: `${index * 60 + ti * 80}ms` }}
          >
            <img
              src={`https://flagcdn.com/w40/${team.flagCode}.png`}
              className="w-7 h-auto rounded-sm shrink-0 shadow-sm"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{team.name}</div>
              <div className="text-[10px] font-mono text-muted-foreground">Group {team.group}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-black font-mono text-muted-foreground">{team.winChance}%</div>
              <div className="text-[10px] font-mono text-muted-foreground/50">to win</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Sweepstake() {
  const { data: predictions, isLoading } = useListPredictions();
  const { mutate: saveSweepstake, isPending: isSaving } = useCreateSweepstake();

  const [step, setStep] = useState(0);
  const [numPlayers, setNumPlayers] = useState(10);
  const [stageIdx, setStageIdx] = useState(1); // Round of 32
  const [players, setPlayers] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [savedGameId, setSavedGameId] = useState<string | null>(null);

  const stage = STAGE_OPTIONS[stageIdx];
  const teamsPerPlayer = Math.floor(stage.teams / numPlayers);
  const poolSize = teamsPerPlayer * numPlayers;

  const handleConfigNext = useCallback(() => {
    const defaults = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
    setPlayers(defaults);
    setStep(1);
  }, [numPlayers]);

  const getPool = useCallback((): Team[] => {
    if (!predictions) return [];
    return predictions.slice(0, poolSize).map((p) => ({
      id: p.team.id,
      name: p.team.name,
      flagCode: p.team.flagCode,
      group: p.team.group,
      winChance: p.winChance,
      rating: p.rating,
    }));
  }, [predictions, poolSize]);

  const handleDraw = useCallback(() => {
    const pool = getPool();
    const named = players.map((p, i) => p.trim() || `Player ${i + 1}`);
    const result = buildAssignments(named, pool, teamsPerPlayer);
    setAssignments(result);
    setStep(2);
  }, [getPool, players, teamsPerPlayer]);

  const handleRedraw = useCallback(() => {
    const pool = getPool();
    const named = players.map((p, i) => p.trim() || `Player ${i + 1}`);
    const result = buildAssignments(named, pool, teamsPerPlayer);
    setAssignments(result);
    setSavedGameId(null);
  }, [getPool, players, teamsPerPlayer]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAssignments([]);
    setSavedGameId(null);
  }, []);

  const handleSave = useCallback(() => {
    saveSweepstake(
      { data: { stage: stage.label, assignments } },
      { onSuccess: (res) => setSavedGameId(res.gameId) },
    );
  }, [saveSweepstake, stage.label, assignments]);

  return (
    <div className="max-w-3xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">
          Sweepstake <span className="text-primary">Planner</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">
          Random team draw · Power-seeded pool
        </p>
      </header>

      {step < 2 && <Steps current={step} />}

      {step === 0 && (
        <ConfigureStep
          numPlayers={numPlayers}
          setNumPlayers={setNumPlayers}
          stageIdx={stageIdx}
          setStageIdx={setStageIdx}
          teamsPerPlayer={teamsPerPlayer}
          poolSize={poolSize}
          onNext={handleConfigNext}
          loading={isLoading}
        />
      )}

      {step === 1 && (
        <PlayersStep
          players={players}
          setPlayers={setPlayers}
          onBack={() => setStep(0)}
          onDraw={handleDraw}
        />
      )}

      {step === 2 && (
        <ResultsStep
          assignments={assignments}
          stage={stage.label}
          onRedraw={handleRedraw}
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
          savedGameId={savedGameId}
        />
      )}
    </div>
  );
}
