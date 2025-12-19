import { redirect } from "react-router";

export const loader = async () =>
  redirect("https://shop.nw-union.net", { status: 307 });
