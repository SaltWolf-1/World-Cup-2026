import { Router } from "express";
import { db } from "@workspace/db";
import { matchesTable, teamsTable, highlightsTable } from "@workspace/db";
import { eq, or, and } from "drizzle-orm";

export const matchesRouter = Router();

async function buildMatch(m: typeof matchesTable.$inferSelect, teams: Map<number, typeof teamsTable.$inferSelect>) {
  const ht = teams.get(m.homeTeamId);
  const at = teams.get(m.awayTeamId);
  return {
    id: m.id,
    homeTeam: ht ? { id: ht.id, name: ht.name, flagCode: ht.flagCode, group: ht.group, isFollowed: ht.isFollowed } : null,
    awayTeam: at ? { id: at.id, name: at.name, flagCode: at.flagCode, group: at.group, isFollowed: at.isFollowed } : null,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: m.status,
    kickoffTime: m.kickoffTime,
    stage: m.stage,
    group: m.group,
    venue: m.venue,
    minute: m.minute,
  };
}

matchesRouter.get("/live", async (_req, res) => {
  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));
  const matches = await db.select().from(matchesTable).where(eq(matchesTable.status, "live"));
  const result = await Promise.all(matches.map(m => buildMatch(m, teamMap)));
  res.json(result);
});

matchesRouter.get("/today", async (_req, res) => {
  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const matches = await db.select().from(matchesTable);
  const todayMatches = matches.filter(m => {
    const d = new Date(m.kickoffTime);
    return d >= startOfDay && d < endOfDay;
  });
  const result = await Promise.all(todayMatches.map(m => buildMatch(m, teamMap)));
  res.json(result);
});

matchesRouter.get("/", async (req, res) => {
  const { status, group, teamId } = req.query;
  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  let allMatches = await db.select().from(matchesTable);

  if (status) {
    allMatches = allMatches.filter(m => m.status === status);
  }
  if (group) {
    allMatches = allMatches.filter(m => m.group === group);
  }
  if (teamId) {
    const tid = parseInt(teamId as string);
    allMatches = allMatches.filter(m => m.homeTeamId === tid || m.awayTeamId === tid);
  }

  allMatches.sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime());
  const result = await Promise.all(allMatches.map(m => buildMatch(m, teamMap)));
  res.json(result);
});

matchesRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  const [m] = await db.select().from(matchesTable).where(eq(matchesTable.id, id));
  if (!m) return res.status(404).json({ error: "Not found" });

  const highlights = await db.select().from(highlightsTable).where(eq(highlightsTable.matchId, id));

  const base = await buildMatch(m, teamMap);
  res.json({
    ...base,
    highlights: highlights.map(h => ({
      id: h.id,
      matchId: h.matchId,
      type: h.type,
      minute: h.minute,
      description: h.description,
      playerName: h.playerName,
      teamId: h.teamId,
    })),
    events: highlights.map(h => ({
      id: h.id,
      type: h.type,
      minute: h.minute,
      description: h.description,
      playerName: h.playerName,
      teamId: h.teamId,
    })),
  });
});
