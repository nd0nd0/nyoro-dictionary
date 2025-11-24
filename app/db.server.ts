import { drizzle } from "drizzle-orm/d1";
import * as schema from "../drizzle/schema";
import { eq, like, sql, desc, inArray } from "drizzle-orm";
import type { AppLoadContext } from "react-router";

export function getDB(env: D1Database) {
  return drizzle(env, { schema });
}

/**
 * Search dictionary entries using FTS5 full-text search
 * @param db Database instance
 * @param query Search query string
 * @param letter Optional letter filter (A-Z)
 * @param limit Maximum number of results
 */
export async function searchDictionary(
  db: ReturnType<typeof getDB>,
  query: string,
  letter?: string,
  limit: number = 50
) {
  try {
    if (query) {
      // FTS5 full-text search
      const searchResults = await db
        .select()
        .from(schema.dictionarySearch)
        .where(
          sql`${schema.dictionarySearch.englishTerm} MATCH ${query} OR ${schema.dictionarySearch.runyoroTerm} MATCH ${query}`
        )
        .orderBy(desc(schema.dictionarySearch.rank))
        .limit(limit);

      // Get full entries for the search results
      const rowids = searchResults
        .map((r) => r.rowid)
        .filter((id): id is number => id !== null);
      if (rowids.length === 0) return [];

      // Build query with letter filter if provided
      if (letter) {
        return await db
          .select()
          .from(schema.dictionaryEntries)
          .where(
            sql`${inArray(schema.dictionaryEntries.id, rowids)} AND ${
              schema.dictionaryEntries.englishTerm
            } LIKE ${letter + "%"}`
          )
          .limit(limit);
      } else {
        return await db
          .select()
          .from(schema.dictionaryEntries)
          .where(inArray(schema.dictionaryEntries.id, rowids))
          .limit(limit);
      }
    } else if (letter) {
      // Just filter by letter
      return await db
        .select()
        .from(schema.dictionaryEntries)
        .where(like(schema.dictionaryEntries.englishTerm, `${letter}%`))
        .limit(limit);
    } else {
      // Return first N entries
      return await db.select().from(schema.dictionaryEntries).limit(limit);
    }
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

/**
 * Get a word by its slug (English term)
 * @param db Database instance
 * @param slug Word slug (lowercase English term)
 */
export async function getWordBySlug(
  db: ReturnType<typeof getDB>,
  slug: string
) {
  const results = await db
    .select()
    .from(schema.dictionaryEntries)
    .where(
      sql`LOWER(${
        schema.dictionaryEntries.englishTerm
      }) = ${slug.toLowerCase()}`
    )
    .limit(1);

  return results[0] || null;
}

/**
 * Get all words starting with a specific letter
 * @param db Database instance
 * @param letter Letter to filter by (A-Z)
 * @param limit Maximum number of results
 */
export async function getWordsByLetter(
  db: ReturnType<typeof getDB>,
  letter: string,
  limit: number = 100
) {
  return await db
    .select()
    .from(schema.dictionaryEntries)
    .where(like(schema.dictionaryEntries.englishTerm, `${letter}%`))
    .limit(limit);
}
