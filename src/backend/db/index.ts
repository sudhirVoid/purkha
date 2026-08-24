import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize the neon serverless driver
const sql = neon(databaseUrl);

// Initialize drizzle with the schema
export const db = drizzle(sql, { schema });
