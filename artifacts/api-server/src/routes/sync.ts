import { Router } from "express";
import { db } from "@workspace/db";
import { teamsTable, matchesTable, highlightsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export const syncRouter = Router();

const DATA_URL = "https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/worldcup.json";

const FLAG_MAP: Record<string, string> = {
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
  "Canada": "ca", "Bosnia & Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
  "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
  "USA": "us", "Paraguay": "py", "Australia": "au", "Turkey": "tr",
  "Argentina": "ar", "Germany": "de", "Japan": "jp", "Spain": "es",
  "France": "fr", "England": "gb-eng", "Netherlands": "nl", "Portugal": "pt",
  "Belgium": "be", "Croatia": "hr", "Uruguay": "uy", "Colombia": "co",
  "Senegal": "sn", "Egypt": "eg", "Iran": "ir", "Iraq": "iq",
  "Ecuador": "ec", "Ghana": "gh", "Tunisia": "tn", "Algeria": "dz",
  "Saudi Arabia": "sa", "New Zealand": "nz", "Denmark": "dk", "Serbia": "rs",
  "Austria": "at", "Sweden": "se", "Norway": "no", "Panama": "pa",
  "Uzbekistan": "uz", "Jordan": "jo", "Ivory Coast": "ci", "DR Congo": "cd",
  "Cape Verde": "cv", "Curaçao": "cw", "Cameroon": "cm", "Ghana": "gh",
};

function parseKickoff(dateStr: string, timeStr?: string): Date {
  if (!timeStr) return new Date(dateStr + "T17:00:00Z");
  const match = timeStr.match(/^(\d+):(\d+)\s+UTC([+-]\d+(?:\.\d+)?)?/);
  if (!match) return new Date(dateStr + "T17:00:00Z");
  const [, h, m, offset] = match;
  const off = parseFloat(offset || "0");
  const utcHour = parseInt(h) - off;
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCHours(Math.floor(utcHour), Math.round((utcHour % 1) * 60) + parseInt(m), 0, 0);
  return d;
}

syncRouter.post("/sync", async (_req, res) => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json() as { matches: any[] };
    const rawMatches = data.matches;

    const allTeams = await db.select().from(teamsTable);
    const teamNameMap = new Map(allTeams.map(t => [t.name, t.id]));

    let updated = 0;
    let newHighlights = 0;

    for (const m of rawMatches) {
      if (!m.group || !m.score) continue;
      const homeId = teamNameMap.get(m.team1);
      const awayId = teamNameMap.get(m.team2);
      if (!homeId || !awayId) continue;

      const homeScore = m.score.ft[0];
      const awayScore = m.score.ft[1];
      const kickoff = parseKickoff(m.date, m.time);

      // Find the existing match
      const existing = allTeams && await db.select()
        .from(matchesTable)
        .where(
          and(
            eq(matchesTable.homeTeamId, homeId),
            eq(matchesTable.awayTeamId, awayId),
          )
        );

      if (!existing || existing.length === 0) continue;
      const dbMatch = existing[0];

      // Update score and status if changed
      if (dbMatch.homeScore !== homeScore || dbMatch.awayScore !== awayScore || dbMatch.status !== "completed") {
        await db.update(matchesTable)
          .set({ homeScore, awayScore, status: "completed", minute: null })
          .where(eq(matchesTable.id, dbMatch.id));
        updated++;

        // Sync highlights for this match
        const existingHighlights = await db.select().from(highlightsTable)
          .where(eq(highlightsTable.matchId, dbMatch.id));

        if (existingHighlights.length === 0) {
          const allGoals = [
            ...(m.goals1 || []).map((g: any) => ({ ...g, teamId: homeId, oppId: awayId })),
            ...(m.goals2 || []).map((g: any) => ({ ...g, teamId: awayId, oppId: homeId })),
          ];
          for (const gx of allGoals) {
            const min = parseInt(String(gx.minute).replace(/\+.*/, "").replace("'", "")) || 0;
            const scoringTeamId = gx.owngoal ? gx.oppId : gx.teamId;
            const desc = gx.owngoal
              ? `OWN GOAL - ${gx.name} (${gx.minute}')`
              : gx.penalty
                ? `GOAL (pen.) - ${gx.name} (${gx.minute}')`
                : `GOAL - ${gx.name} (${gx.minute}')`;
            await db.insert(highlightsTable).values({
              matchId: dbMatch.id,
              type: "goal",
              minute: min,
              description: desc,
              playerName: gx.name,
              teamId: scoringTeamId,
            });
            newHighlights++;
          }
        }
      }
    }

    res.json({ success: true, matchesUpdated: updated, highlightsAdded: newHighlights, syncedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
