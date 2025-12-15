import { redirect } from "react-router";

export const loader = async () =>
  redirect("https://www.youtube.com/@nw-union", { status: 307 });
