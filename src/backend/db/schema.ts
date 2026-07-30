import { pgTable, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const familyTrees = pgTable("family_trees", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
