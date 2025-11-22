import { Outlet, useMatches, Link } from "react-router";
import type { Route } from "./+types/_layout";
import { getDB, searchDictionary } from "~/db.server";
import { RadialDial } from "~/components/RadialDial";
import { SearchBar } from "~/components/SearchBar";
import { Header } from "~/components/Header";

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q") || "";
  const letter = url.searchParams.get("letter") || "";

  const db = getDB(context.cloudflare.env.DB);

  // Fetch initial word list (limit 50) or filtered list
  const words = await searchDictionary(db, searchQuery, letter, 50);

  return { words, searchQuery, letter };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const isWordRoute = matches.some((m) => m.pathname.startsWith("/word/"));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Mobile: Single column | Desktop: 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_300px_1fr] gap-0">
        {/* Desktop: Left Sidebar - Hidden on mobile when viewing a word */}
        <aside
          className={`${
            isWordRoute ? "hidden md:block" : "hidden md:block"
          } bg-stone-50 border-r border-gray-200 h-screen sticky top-0 overflow-y-auto`}
        >
          <div className="p-4 space-y-6">
            {/* Search Bar */}
            <SearchBar defaultValue={loaderData.searchQuery} />

            {/* Radial Dial */}
            <RadialDial />
          </div>
        </aside>

        {/* Mobile: Search + Dial + Word List in single column */}
        <div className={`md:hidden ${isWordRoute ? "hidden" : "block"}`}>
          {/* Search Bar */}
          <div className="p-4 bg-stone-50">
            <SearchBar defaultValue={loaderData.searchQuery} />
          </div>

          {/* Horizontal Radial Dial (already in RadialDial component) */}
          <RadialDial />

          {/* Word List */}
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Words ({loaderData.words.length})
              </h2>
              {loaderData.letter && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing words starting with{" "}
                  <span className="font-semibold">{loaderData.letter}</span>
                </p>
              )}
              {loaderData.searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Search:{" "}
                  <span className="font-semibold">
                    {loaderData.searchQuery}
                  </span>
                </p>
              )}
            </div>

            {loaderData.words.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No words found</p>
                {(loaderData.letter || loaderData.searchQuery) && (
                  <p className="text-sm mt-2">
                    Try a different letter or search term
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {loaderData.words.map((word) => (
                  <Link
                    key={word.id}
                    to={`/word/${word.englishTerm.toLowerCase()}${
                      loaderData.letter ? `?letter=${loaderData.letter}` : ""
                    }${
                      loaderData.searchQuery
                        ? `${loaderData.letter ? "&" : "?"}q=${
                            loaderData.searchQuery
                          }`
                        : ""
                    }`}
                    viewTransition
                    className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <p className="font-medium text-gray-900">
                      {word.englishTerm}
                    </p>
                    <p className="text-sm text-gray-600">{word.runyoroTerm}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Middle Word List */}
        <div
          className={`hidden md:block ${
            isWordRoute ? "md:block" : "md:block"
          } border-r border-gray-200 h-screen overflow-y-auto`}
        >
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                Words ({loaderData.words.length})
              </h2>
              {loaderData.letter && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing words starting with{" "}
                  <span className="font-semibold">{loaderData.letter}</span>
                </p>
              )}
              {loaderData.searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Search:{" "}
                  <span className="font-semibold">
                    {loaderData.searchQuery}
                  </span>
                </p>
              )}
            </div>

            {loaderData.words.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No words found</p>
                {(loaderData.letter || loaderData.searchQuery) && (
                  <p className="text-sm mt-2">
                    Try a different letter or search term
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {loaderData.words.map((word) => (
                  <Link
                    key={word.id}
                    to={`/word/${word.englishTerm.toLowerCase()}${
                      loaderData.letter ? `?letter=${loaderData.letter}` : ""
                    }${
                      loaderData.searchQuery
                        ? `${loaderData.letter ? "&" : "?"}q=${
                            loaderData.searchQuery
                          }`
                        : ""
                    }`}
                    viewTransition
                    className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-gray-900">
                      {word.englishTerm}
                    </p>
                    <p className="text-sm text-gray-600">{word.runyoroTerm}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Main Content Area */}
        <main className="h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
