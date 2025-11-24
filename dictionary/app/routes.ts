import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Nested layout for master-detail pattern
  layout("routes/_layout.tsx", [
    // Root index - shows welcome message
    index("routes/_layout._index.tsx"),

    // Individual word pages - each word gets its own URL for SEO
    // Example: /word/ground, /word/abandon, etc.
    route("word/:slug", "routes/_layout.word.$slug.tsx"),
  ]),
] satisfies RouteConfig;
