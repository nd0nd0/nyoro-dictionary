import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  // Use virtual import during development, built file for production
  import.meta.env.DEV
    ? () => import("virtual:react-router/server-build")
    : // @ts-expect-error - This will be resolved after build
      () => import("../build/server/index.js"),
  import.meta.env.MODE
);

export default {
  fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
