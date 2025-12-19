import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // apps
  route("apps", "routes/apps.tsx"),

  // docs
  route("docs", "routes/docs/list.tsx"),
  route("docs/:slug", "routes/docs/view.tsx"),
  route("docs/:slug/edit", "routes/docs/edit.tsx"),

  // videos
  route("videos", "routes/videos.tsx"),

  // you
  route("you", "routes/you.tsx"),

  // auth
  route("signin", "routes/signin.ts"),
  route("signout", "routes/signout.ts"),

  // SNS リダイレクト
  route("discord", "routes/discord.ts"),
  route("youtube", "routes/youtube.ts"),
  route("github", "routes/github.ts"),
  route("shop", "routes/shop.ts"),
] satisfies RouteConfig;
