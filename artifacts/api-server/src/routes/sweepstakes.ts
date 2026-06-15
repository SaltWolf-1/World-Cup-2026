import { Router } from "express";
import { db, sweepstakesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const sweepstakesRouter = Router();

function generateGameId(): string {
  return Math.random().toString(36).slice(2, 6) +
         Math.random().toString(36).slice(2, 6);
}

sweepstakesRouter.post("/", async (req, res) => {
  const { stage, assignments } = req.body;
  if (!stage || !Array.isArray(assignments) || assignments.length === 0) {
    res.status(400).json({ error: "stage and assignments are required" });
    return;
  }

  const gameId = generateGameId();
  await db.insert(sweepstakesTable).values({ gameId, stage, assignments });
  res.status(201).json({ gameId });
});

sweepstakesRouter.get("/:gameId", async (req, res) => {
  const { gameId } = req.params;
  const [row] = await db
    .select()
    .from(sweepstakesTable)
    .where(eq(sweepstakesTable.gameId, gameId));

  if (!row) {
    res.status(404).json({ error: "Sweepstake not found" });
    return;
  }

  res.json(row);
});
