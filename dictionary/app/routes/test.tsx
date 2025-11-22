import { data } from "react-router";
import type { Route } from "./+types/test";
import { getDB } from "~/db.server";
import { inArray, sql } from "drizzle-orm";
import { dictionaryEntries, dictionarySearch } from "drizzle/schema";
export async function loader({ request, context }: Route.LoaderArgs) {
  // /test?q=hello
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return data({
      message: "No query provided",
    });
  }

  const db = getDB(context.cloudflare.env.DB);

  const results = await db
    .select()
    .from(dictionaryEntries)
    .where(
      inArray(
        dictionaryEntries.id,
        db
          .select({ id: dictionarySearch.rowid })
          .from(dictionarySearch)
          .where(sql`${dictionarySearch} MATCH ${query + "*"}`)
          .orderBy(dictionarySearch.rank)
          .limit(20)
      )
    );

  return data({
    message: results,
  });
}

export default function Test({ loaderData }: Route.ComponentProps) {
  return (
    <div className="text-red-500">{JSON.stringify(loaderData.message)}</div>
  );
}
