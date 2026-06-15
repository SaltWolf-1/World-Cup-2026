import { readFileSync } from "fs";
import { createRequire } from "module";
import pkg from "pg";

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DATA_URL = "https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/worldcup.json";

// Map openfootball team names → ISO 3166-1 alpha-2 flag codes
const FLAG_MAP = {
  "Mexico": "mx",
  "South Africa": "za",
  "South Korea": "kr",
  "Czech Republic": "cz",
  "Canada": "ca",
  "Bosnia & Herzegovina": "ba",
  "Qatar": "qa",
  "Switzerland": "ch",
  "Brazil": "br",
  "Morocco": "ma",
  "Haiti": "ht",
  "Scotland": "gb-sct",
  "USA": "us",
  "Paraguay": "py",
  "Australia": "au",
  "Turkey": "tr",
  "Argentina": "ar",
  "Germany": "de",
  "Japan": "jp",
  "Spain": "es",
  "France": "fr",
  "England": "gb-eng",
  "Netherlands": "nl",
  "Portugal": "pt",
  "Belgium": "be",
  "Croatia": "hr",
  "Uruguay": "uy",
  "Colombia": "co",
  "Senegal": "sn",
  "Egypt": "eg",
  "Iran": "ir",
  "Iraq": "iq",
  "Ecuador": "ec",
  "Ghana": "gh",
  "Nigeria": "ng",
  "Tunisia": "tn",
  "Algeria": "dz",
  "Saudi Arabia": "sa",
  "New Zealand": "nz",
  "Denmark": "dk",
  "Serbia": "rs",
  "Austria": "at",
  "Sweden": "se",
  "Norway": "no",
  "Panama": "pa",
  "Honduras": "hn",
  "Guatemala": "gt",
  "Bolivia": "bo",
  "Chile": "cl",
  "Peru": "pe",
  "Uzbekistan": "uz",
  "Jordan": "jo",
  "Ivory Coast": "ci",
  "DR Congo": "cd",
  "Cape Verde": "cv",
  "Curaçao": "cw",
  "Indonesia": "id",
  "Jamaica": "jm",
  "Kenya": "ke",
  "Costa Rica": "cr",
  "Wales": "gb-wls",
  "Ukraine": "ua",
  "Italy": "it",
  "Poland": "pl",
  "Scotland": "gb-sct",
  "Romania": "ro",
  "Hungary": "hu",
  "Slovakia": "sk",
  "Slovenia": "si",
  "Albania": "al",
  "Georgia": "ge",
  "Cameroon": "cm",
  "Mali": "ml",
  "Angola": "ao",
};

// Round name normalization for stage field
function toStage(round, group) {
  if (round && round.startsWith("Matchday")) return "Group Stage";
  if (round === "Round of 32") return "Round of 32";
  if (round === "Round of 16") return "Round of 16";
  if (round === "Quarter-finals") return "Quarter-finals";
  if (round === "Semi-finals") return "Semi-finals";
  if (round === "Third place play-off") return "Third Place";
  if (round === "Final") return "Final";
  return round || "Group Stage";
}

function parseGroup(g) {
  if (!g) return null;
  return g.replace("Group ", "");
}

function parseTime(dateStr, timeStr) {
  // timeStr like "13:00 UTC-6" or "20:00 UTC+3"
  if (!timeStr) return new Date(dateStr + "T12:00:00Z");
  const match = timeStr.match(/^(\d+):(\d+)\s+UTC([+-]\d+)?/);
  if (!match) return new Date(dateStr + "T12:00:00Z");
  const [, h, m, offset] = match;
  const off = parseInt(offset || "0");
  const utcHour = parseInt(h) - off;
  return new Date(`${dateStr}T${String(utcHour).padStart(2, "0")}:${m}:00Z`);
}

function matchStatus(m) {
  if (!m.score) return "upcoming";
  const now = new Date();
  const kickoff = parseTime(m.date, m.time);
  if (kickoff > now) return "upcoming";
  return "completed";
}

async function run() {
  const res = await fetch(DATA_URL);
  const data = await res.json();
  const matches = data.matches;

  // Collect all group stage team names
  const groupTeams = new Map(); // name → { group }
  for (const m of matches) {
    const g = parseGroup(m.group);
    if (!g) continue;
    const stage = toStage(m.round, m.group);
    if (stage !== "Group Stage") continue;
    if (!m.team1.includes(" ") && m.team1.length <= 2) continue; // skip placeholders like 1A, 2B
    if (m.team1.match(/^\d/)) continue;
    if (m.team2.match(/^\d/)) continue;
    if (!groupTeams.has(m.team1)) groupTeams.set(m.team1, g);
    if (!groupTeams.has(m.team2)) groupTeams.set(m.team2, g);
  }

  console.log(`Found ${groupTeams.size} group stage teams`);

  // Clear tables
  await pool.query("DELETE FROM highlights");
  await pool.query("DELETE FROM predictions");
  await pool.query("DELETE FROM matches");
  await pool.query("DELETE FROM teams");
  await pool.query("ALTER SEQUENCE teams_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE matches_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE highlights_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE predictions_id_seq RESTART WITH 1");

  // Insert teams
  const teamIdMap = new Map(); // name → db id
  for (const [name, group] of [...groupTeams.entries()].sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]))) {
    const flagCode = FLAG_MAP[name] || name.slice(0, 2).toLowerCase();
    const result = await pool.query(
      `INSERT INTO teams (name, flag_code, "group", is_followed) VALUES ($1, $2, $3, false) RETURNING id`,
      [name, flagCode, group]
    );
    teamIdMap.set(name, result.rows[0].id);
  }
  console.log(`Inserted ${teamIdMap.size} teams`);

  // Follow a few notable teams
  const toFollow = ["Brazil", "Argentina", "France", "England", "Spain", "Germany", "USA"];
  for (const name of toFollow) {
    if (teamIdMap.has(name)) {
      await pool.query("UPDATE teams SET is_followed = true WHERE name = $1", [name]);
    }
  }

  // Insert group stage matches only (knock-out placeholders exist but team IDs aren't real)
  let matchCount = 0;
  let highlightCount = 0;

  for (const m of matches) {
    const stage = toStage(m.round, m.group);
    if (stage !== "Group Stage") continue;
    if (!teamIdMap.has(m.team1) || !teamIdMap.has(m.team2)) continue;

    const homeId = teamIdMap.get(m.team1);
    const awayId = teamIdMap.get(m.team2);
    const kickoff = parseTime(m.date, m.time);
    const status = matchStatus(m);
    const homeScore = m.score ? m.score.ft[0] : null;
    const awayScore = m.score ? m.score.ft[1] : null;
    const group = parseGroup(m.group);
    const venue = m.ground || null;

    const mr = await pool.query(
      `INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, status, kickoff_time, stage, "group", venue, minute) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [homeId, awayId, homeScore, awayScore, status, kickoff.toISOString(), stage, group, venue, null]
    );
    const matchId = mr.rows[0].id;
    matchCount++;

    // Insert goal highlights
    const goals = [
      ...(m.goals1 || []).map(g => ({ ...g, teamId: homeId })),
      ...(m.goals2 || []).map(g => ({ ...g, teamId: awayId })),
    ];
    for (const g of goals) {
      const min = parseInt(String(g.minute).replace("+", "").replace("'", "")) || 0;
      const type = g.penalty ? "penalty" : g.owngoal ? "goal" : "goal";
      const ownTeamId = g.owngoal ? (g.teamId === homeId ? awayId : homeId) : g.teamId;
      const desc = g.owngoal
        ? `OWN GOAL - ${g.name} (${min}')`
        : g.penalty
          ? `GOAL (P) - ${g.name} (${min}')`
          : `GOAL - ${g.name} (${min}')`;
      await pool.query(
        "INSERT INTO highlights (match_id, type, minute, description, player_name, team_id) VALUES ($1,$2,$3,$4,$5,$6)",
        [matchId, type, min, desc, g.name, ownTeamId]
      );
      highlightCount++;
    }
  }
  console.log(`Inserted ${matchCount} group stage matches, ${highlightCount} highlights`);

  // Seed predictions based on real team ratings
  const ratings = {
    "Brazil": { win: 14.0, sf: 52, qf: 72, r16: 90, rating: 91 },
    "Argentina": { win: 16.5, sf: 58, qf: 78, r16: 92, rating: 93 },
    "France": { win: 13.0, sf: 50, qf: 70, r16: 88, rating: 90 },
    "Spain": { win: 12.0, sf: 48, qf: 68, r16: 87, rating: 89 },
    "England": { win: 9.5, sf: 40, qf: 65, r16: 85, rating: 87 },
    "Germany": { win: 6.0, sf: 30, qf: 55, r16: 78, rating: 82 },
    "Netherlands": { win: 7.5, sf: 35, qf: 60, r16: 82, rating: 85 },
    "Portugal": { win: 7.0, sf: 34, qf: 58, r16: 80, rating: 84 },
    "USA": { win: 8.0, sf: 32, qf: 58, r16: 82, rating: 82 },
    "Belgium": { win: 4.0, sf: 22, qf: 46, r16: 72, rating: 79 },
    "Uruguay": { win: 3.5, sf: 20, qf: 42, r16: 68, rating: 77 },
    "Colombia": { win: 2.8, sf: 16, qf: 36, r16: 62, rating: 75 },
    "Mexico": { win: 4.0, sf: 22, qf: 45, r16: 70, rating: 78 },
    "Canada": { win: 4.5, sf: 24, qf: 48, r16: 72, rating: 78 },
    "Switzerland": { win: 1.8, sf: 12, qf: 28, r16: 55, rating: 73 },
    "Morocco": { win: 3.5, sf: 20, qf: 42, r16: 65, rating: 77 },
    "Croatia": { win: 2.5, sf: 15, qf: 34, r16: 58, rating: 75 },
    "Japan": { win: 2.5, sf: 15, qf: 34, r16: 60, rating: 74 },
    "Denmark": { win: 2.0, sf: 13, qf: 30, r16: 58, rating: 74 },
    "Serbia": { win: 1.8, sf: 11, qf: 26, r16: 50, rating: 72 },
    "Australia": { win: 0.8, sf: 6, qf: 15, r16: 35, rating: 66 },
    "Senegal": { win: 1.5, sf: 10, qf: 25, r16: 50, rating: 72 },
    "Ecuador": { win: 2.0, sf: 13, qf: 30, r16: 56, rating: 73 },
    "Turkey": { win: 1.5, sf: 10, qf: 24, r16: 46, rating: 71 },
    "Austria": { win: 1.0, sf: 7, qf: 18, r16: 38, rating: 68 },
    "South Korea": { win: 2.0, sf: 13, qf: 30, r16: 55, rating: 72 },
    "Iran": { win: 0.6, sf: 5, qf: 12, r16: 26, rating: 63 },
    "Sweden": { win: 1.2, sf: 8, qf: 20, r16: 42, rating: 70 },
    "Norway": { win: 1.2, sf: 8, qf: 20, r16: 42, rating: 70 },
    "Paraguay": { win: 0.5, sf: 4, qf: 10, r16: 25, rating: 62 },
    "Bolivia": { win: 0.2, sf: 2, qf: 5, r16: 12, rating: 55 },
    "Scotland": { win: 1.0, sf: 7, qf: 18, r16: 40, rating: 69 },
    "Ivory Coast": { win: 1.2, sf: 8, qf: 20, r16: 42, rating: 70 },
    "Egypt": { win: 0.8, sf: 6, qf: 15, r16: 35, rating: 65 },
    "Qatar": { win: 0.3, sf: 2, qf: 6, r16: 14, rating: 56 },
    "Saudi Arabia": { win: 0.8, sf: 6, qf: 15, r16: 30, rating: 65 },
    "Uzbekistan": { win: 0.3, sf: 2, qf: 6, r16: 14, rating: 55 },
    "New Zealand": { win: 0.3, sf: 2, qf: 6, r16: 15, rating: 55 },
    "Panama": { win: 0.4, sf: 3, qf: 8, r16: 18, rating: 58 },
    "Haiti": { win: 0.2, sf: 1, qf: 4, r16: 10, rating: 50 },
    "South Africa": { win: 0.5, sf: 4, qf: 10, r16: 24, rating: 62 },
    "Tunisia": { win: 0.5, sf: 4, qf: 10, r16: 25, rating: 61 },
    "Algeria": { win: 0.5, sf: 4, qf: 12, r16: 25, rating: 62 },
    "Ghana": { win: 0.6, sf: 5, qf: 12, r16: 26, rating: 63 },
    "DR Congo": { win: 0.5, sf: 4, qf: 10, r16: 22, rating: 61 },
    "Cameroon": { win: 0.6, sf: 5, qf: 12, r16: 26, rating: 63 },
    "Bosnia & Herzegovina": { win: 0.4, sf: 3, qf: 8, r16: 18, rating: 58 },
    "Cape Verde": { win: 0.3, sf: 2, qf: 5, r16: 12, rating: 54 },
    "Curaçao": { win: 0.2, sf: 1, qf: 3, r16: 8, rating: 48 },
    "Iraq": { win: 0.4, sf: 3, qf: 8, r16: 18, rating: 57 },
    "Jordan": { win: 0.3, sf: 2, qf: 6, r16: 14, rating: 55 },
    "Czech Republic": { win: 1.0, sf: 7, qf: 18, r16: 38, rating: 68 },
  };

  const defaultRating = { win: 0.3, sf: 2, qf: 5, r16: 12, rating: 52 };

  for (const [name, teamId] of teamIdMap.entries()) {
    const r = ratings[name] || defaultRating;
    await pool.query(
      "INSERT INTO predictions (team_id, win_chance, semifinal_chance, quarter_final_chance, round_of16_chance, eliminated, rating) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [teamId, r.win, r.sf, r.qf, r.r16, false, r.rating]
    );
  }
  console.log(`Inserted ${teamIdMap.size} predictions`);

  await pool.end();
  console.log("Done!");
}

run().catch(e => { console.error(e); process.exit(1); });
