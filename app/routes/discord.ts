import { redirect } from "react-router";

export async function loader() {
  return redirect("https://discord.gg/faPNeuCQdF", { status: 307 });
}
