import { drizzle } from "drizzle-orm/d1";
import * as schema from "../drizzle/schema";
import type { AppLoadContext } from "react-router";

export function getDb(dbBinding: D1Database) {
  return drizzle(dbBinding, { schema });
}
