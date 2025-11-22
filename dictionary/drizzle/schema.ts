import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dictionaryEntries = sqliteTable("dictionary_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  englishTerm: text("english_term").notNull(),
  runyoroTerm: text("runyoro_term").notNull(),
  swahiliTerm: text("swahili_term"),
  examples: text("examples"),
  imagePath: text("image"),
  audioPath: text("audio"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`
  ),
});

export const dictionarySearch = sqliteTable("dictionary_search", {
  englishTerm: text("english_term"),
  runyoroTerm: text("runyoro_term"),
  swahiliTerm: text("swahili_term"),
  rowid: integer("rowid"),
  rank: integer("rank"),
});

export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;
export type NewDictionaryEntry = typeof dictionaryEntries.$inferInsert;
