import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const highlightsTable = pgTable("highlights", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  type: text("type").notNull(),
  minute: integer("minute").notNull(),
  description: text("description").notNull(),
  playerName: text("player_name"),
  teamId: integer("team_id"),
});

export const insertHighlightSchema = createInsertSchema(highlightsTable).omit({ id: true });
export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlightsTable.$inferSelect;
