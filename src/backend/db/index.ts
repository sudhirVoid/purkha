import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "";

// Only initialize if the URL is present to prevent startup crashes.
// If it's missing, any actual DB query will throw a descriptive error when called,
// instead of crashing the entire SSR server on boot.
export const sql = databaseUrl 
  ? neon(databaseUrl) 
  : (() => { throw new Error("DATABASE_URL environment variable is not set"); }) as any;

export const db = databaseUrl 
  ? drizzle(sql, { schema }) 
  : new Proxy({} as any, {
      get() {
        throw new Error("DATABASE_URL environment variable is not set");
      }
    });
