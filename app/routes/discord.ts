import { redirect } from "react-router";
import type { Route } from "./+types/discord";

const DISCORD_GENERAL_CHANNEL_URL =
  "https://discord.com/channels/805068364476973076/805068364476973079";
const DISCORD_INVITE_URL = "https://discord.gg/faPNeuCQdF";

export const loader = async ({ context, request }: Route.LoaderArgs) =>
  (await context.auth.auth(request)).match(
    // ログインユーザーは, Discord サーバーの #general チャンネルへリダイレクト
    () => redirect(DISCORD_GENERAL_CHANNEL_URL, { status: 307 }),
    // 非ログインユーザーは, Discord 招待リンクへリダイレクト
    () => redirect(DISCORD_INVITE_URL, { status: 307 }),
  );
