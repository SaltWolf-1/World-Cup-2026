import { Router } from "express";
import { db } from "@workspace/db";
import { highlightsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const highlightsRouter = Router();

highlightsRouter.get("/", async (req, res) => {
  const { matchId } = req.query;

  let highlights;
  if (matchId) {
    const mid = parseInt(matchId as string);
    highlights = await db.select().from(highlightsTable).where(eq(highlightsTable.matchId, mid));
  } else {
    highlights = await db.select().from(highlightsTable);
  }

  highlights.sort((a, b) => b.minute - a.minute);

  res.json(highlights.map(h => ({
    id: h.id,
    matchId: h.matchId,
    type: h.type,
    minute: h.minute,
    description: h.description,
    playerName: h.playerName,
    teamId: h.teamId,
  })));
});
