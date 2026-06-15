import { pgTable, serial, integer, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const predictionsTable = pgTable("predictions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().unique(),
  winChance: real("win_chance").notNull().default(0),
  semifinalChance: real("semifinal_chance").notNull().default(0),
  quarterFinalChance: real("quarter_final_chance").notNull().default(0),
  roundOf16Chance: real("round_of16_chance").notNull().default(0),
  eliminated: boolean("eliminated").notNull().default(false),
  rating: real("rating").notNull().default(0),
});

export const insertPredictionSchema = createInsertSchema(predictionsTable).omit({ id: true });
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictionsTable.$inferSelect;
