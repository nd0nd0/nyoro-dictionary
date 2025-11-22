import { data } from "react-router";
import type { Route } from "./+types/test";

export function loader() {
  return data({
    message: "Hello from Loader",
  });
}

export default function Test({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.message}</div>;
}
