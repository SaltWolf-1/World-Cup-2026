import { Router } from "express";
import { db } from "@workspace/db";
import { predictionsTable, teamsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const predictionsRouter = Router();

predictionsRouter.get("/", async (_req, res) => {
  const predictions = await db.select().from(predictionsTable);
  const allTeams = await db.select().from(teamsTable);
  const teamMap = new Map(allTeams.map(t => [t.id, t]));

  const result = predictions
    .map(p => {
      const t = teamMap.get(p.teamId);
      if (!t) return null;
      return {
        team: { id: t.id, name: t.name, flagCode: t.flagCode, group: t.group, isFollowed: t.isFollowed },
        winChance: p.winChance,
        semifinalChance: p.semifinalChance,
        quarterFinalChance: p.quarterFinalChance,
        roundOf16Chance: p.roundOf16Chance,
        eliminated: p.eliminated,
        rating: p.rating,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.winChance - a!.winChance);

  res.json(result);
});
