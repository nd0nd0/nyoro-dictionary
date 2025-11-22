import { createContext } from "react-router";
import { type PlatformProxy } from "wrangler";

// When using `wrangler.toml` to configure bindings,
// `wrangler types` will generate a `worker-configuration.d.ts` file.
// We use that to define the `Env` interface.
// If you're not using `wrangler.toml`, you can define `Env` manually.
// type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

// declare module "react-router" {
//   interface AppLoadContext {
//     cloudflare: Cloudflare;
//   }
// }

export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();
