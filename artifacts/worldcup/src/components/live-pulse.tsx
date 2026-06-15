export function LivePulse() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
      </span>
      <span className="text-xs font-bold text-destructive uppercase tracking-widest animate-pulse">Live</span>
    </div>
  );
}
