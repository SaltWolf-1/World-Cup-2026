import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, teamsTable, highlightsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res) => {
  const allMatches = await db.select().from(matchesTable);
  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const liveMatches = allMatches.filter(m => m.status === "live");
  const todayMatches = allMatches.filter(m => {
    const d = new Date(m.kickoffTime);
    return d >= startOfDay && d < endOfDay;
  });

  const todayGoals = todayMatches.reduce((sum, m) => {
    if (m.status === "completed" || m.status === "live") {
      return sum + (m.homeScore ?? 0) + (m.awayScore ?? 0);
    }
    return sum;
  }, 0);

  const followedTeams = allTeams.filter(t => t.isFollowed);
  const followedTeamIds = new Set(followedTeams.map(t => t.id));

  const followedTeamsPlaying = liveMatches
    .filter(m => followedTeamIds.has(m.homeTeamId) || followedTeamIds.has(m.awayTeamId))
    .flatMap(m => {
      const result = [];
      if (followedTeamIds.has(m.homeTeamId)) {
        const t = teamMap.get(m.homeTeamId);
        if (t) result.push({ id: t.id, name: t.name, flagCode: t.flagCode, group: t.group, isFollowed: t.isFollowed });
      }
      if (followedTeamIds.has(m.awayTeamId)) {
        const t = teamMap.get(m.awayTeamId);
        if (t) result.push({ id: t.id, name: t.name, flagCode: t.flagCode, group: t.group, isFollowed: t.isFollowed });
      }
      return result;
    });

  const allHighlights = await db.select().from(highlightsTable);
  const goalsByTeam = new Map<number, { playerName: string; goals: number }[]>();
  for (const h of allHighlights) {
    if (h.type === "goal" && h.teamId && h.playerName) {
      if (!goalsByTeam.has(h.teamId)) goalsByTeam.set(h.teamId, []);
      const existing = goalsByTeam.get(h.teamId)!.find(g => g.playerName === h.playerName);
      if (existing) existing.goals++;
      else goalsByTeam.get(h.teamId)!.push({ playerName: h.playerName, goals: 1 });
    }
  }

  const topScorers: { playerName: string; teamId: number; teamName: string; goals: number; flagCode: string }[] = [];
  for (const [teamId, scorers] of goalsByTeam.entries()) {
    const team = teamMap.get(teamId);
    if (!team) continue;
    for (const s of scorers) {
      topScorers.push({ ...s, teamId, teamName: team.name, flagCode: team.flagCode });
    }
  }
  topScorers.sort((a, b) => b.goals - a.goals);

  res.json({
    liveMatchCount: liveMatches.length,
    todayMatchCount: todayMatches.length,
    totalGoalsToday: todayGoals,
    followedTeamsPlaying,
    topScorers: topScorers.slice(0, 10),
  });
});
