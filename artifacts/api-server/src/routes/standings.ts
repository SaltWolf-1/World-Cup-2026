import { Router } from "express";
import { db } from "@workspace/db";
import { teamsTable, matchesTable } from "@workspace/db";

export const standingsRouter = Router();

standingsRouter.get("/", async (req, res) => {
  const { group } = req.query;

  const allTeams = await db.select().from(teamsTable);
  const allMatches = await db.select().from(matchesTable);

  const completedMatches = allMatches.filter(m => m.status === "completed" && m.homeScore !== null && m.awayScore !== null);

  const statsMap = new Map<number, { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number }>();

  for (const t of allTeams) {
    statsMap.set(t.id, { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
  }

  for (const m of completedMatches) {
    const hs = statsMap.get(m.homeTeamId);
    const as_ = statsMap.get(m.awayTeamId);
    if (!hs || !as_) continue;

    hs.played++;
    as_.played++;
    hs.goalsFor += m.homeScore!;
    hs.goalsAgainst += m.awayScore!;
    as_.goalsFor += m.awayScore!;
    as_.goalsAgainst += m.homeScore!;

    if (m.homeScore! > m.awayScore!) {
      hs.wins++; hs.points += 3; as_.losses++;
    } else if (m.homeScore! < m.awayScore!) {
      as_.wins++; as_.points += 3; hs.losses++;
    } else {
      hs.draws++; hs.points++; as_.draws++; as_.points++;
    }
  }

  const groups = [...new Set(allTeams.map(t => t.group))].sort();

  const result = groups
    .filter(g => !group || g === group)
    .map(g => ({
      group: g,
      entries: allTeams
        .filter(t => t.group === g)
        .map(t => {
          const s = statsMap.get(t.id)!;
          return {
            team: { id: t.id, name: t.name, flagCode: t.flagCode, group: t.group, isFollowed: t.isFollowed },
            ...s,
          };
        })
        .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)),
    }));

  res.json(result);
});
