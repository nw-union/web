import { redirect } from "react-router";

export const loader = async () =>
  redirect("https://note.com/nwunion", { status: 307 });
