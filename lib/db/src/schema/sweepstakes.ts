import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const sweepstakesTable = pgTable("sweepstakes", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(),
  stage: text("stage").notNull(),
  assignments: jsonb("assignments").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SavedSweepstake = typeof sweepstakesTable.$inferSelect;
