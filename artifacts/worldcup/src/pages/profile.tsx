import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { UserCircle, LogIn, LogOut, Trophy } from "lucide-react";

export default function Profile() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <UserCircle className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">
            Sign in to save sweepstakes and track your picks
          </p>
        </div>
        <Button
          onClick={login}
          className="gap-2 font-mono uppercase tracking-wider px-8"
          size="lg"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
      </div>
    );
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Fan";
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") || displayName[0]?.toUpperCase() || "?";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight skew-x-[-5deg]">
          Your <span className="text-primary">Profile</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-mono uppercase tracking-wider text-sm">Account & preferences</p>
      </header>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-2xl font-black text-primary">{initials}</span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{displayName}</h2>
          {user.email && (
            <p className="text-muted-foreground font-mono text-sm mt-1">{user.email}</p>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <Trophy className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">World Cup 2026 Fan</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={logout}
          className="gap-2 font-mono uppercase tracking-wider text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
