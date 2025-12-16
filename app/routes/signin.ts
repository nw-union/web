import type { Route } from "./+types/signin";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get("redirectUrl");

  return redirect(redirectUrl ?? "/");
}
