import { Router } from "express";
import { db } from "@workspace/db";
import { teamsTable, matchesTable, predictionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export const teamsRouter = Router();

teamsRouter.get("/", async (_req, res) => {
  const teams = await db.select().from(teamsTable).orderBy(teamsTable.group, teamsTable.name);
  res.json(teams.map(t => ({
    id: t.id,
    name: t.name,
    flagCode: t.flagCode,
    group: t.group,
    isFollowed: t.isFollowed,
  })));
});

teamsRouter.get("/followed", async (_req, res) => {
  const teams = await db.select().from(teamsTable).where(eq(teamsTable.isFollowed, true));
  res.json(teams.map(t => ({
    id: t.id,
    name: t.name,
    flagCode: t.flagCode,
    group: t.group,
    isFollowed: t.isFollowed,
  })));
});

teamsRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, id));
  if (!team) return res.status(404).json({ error: "Not found" });

  const allMatches = await db.select().from(matchesTable).where(
    and(
      eq(matchesTable.homeTeamId, id)
    )
  );
  const awayMatches = await db.select().from(matchesTable).where(
    eq(matchesTable.awayTeamId, id)
  );
  const allTeamMatches = [...allMatches, ...awayMatches].sort(
    (a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime()
  ).slice(0, 5);

  let played = 0, wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  for (const m of [...allMatches, ...awayMatches]) {
    if (m.status === "completed" && m.homeScore !== null && m.awayScore !== null) {
      played++;
      const isHome = m.homeTeamId === id;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const theirGoals = isHome ? m.awayScore : m.homeScore;
      goalsFor += myGoals!;
      goalsAgainst += theirGoals!;
      if (myGoals! > theirGoals!) wins++;
      else if (myGoals! === theirGoals!) draws++;
      else losses++;
    }
  }
  const points = wins * 3 + draws;

  const [pred] = await db.select().from(predictionsTable).where(eq(predictionsTable.teamId, id));

  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  const recentMatches = allTeamMatches.map(m => {
    const ht = teamMap.get(m.homeTeamId);
    const at = teamMap.get(m.awayTeamId);
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
  });

  res.json({
    id: team.id,
    name: team.name,
    flagCode: team.flagCode,
    group: team.group,
    isFollowed: team.isFollowed,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points,
    winChance: pred?.winChance ?? 0,
    recentMatches,
  });
});

teamsRouter.post("/:id/follow", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [team] = await db.update(teamsTable)
    .set({ isFollowed: true })
    .where(eq(teamsTable.id, id))
    .returning();
  if (!team) return res.status(404).json({ error: "Not found" });

  res.json({ id: team.id, name: team.name, flagCode: team.flagCode, group: team.group, isFollowed: team.isFollowed });
});

teamsRouter.delete("/:id/follow", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [team] = await db.update(teamsTable)
    .set({ isFollowed: false })
    .where(eq(teamsTable.id, id))
    .returning();
  if (!team) return res.status(404).json({ error: "Not found" });

  res.json({ id: team.id, name: team.name, flagCode: team.flagCode, group: team.group, isFollowed: team.isFollowed });
});
