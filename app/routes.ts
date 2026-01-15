import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // apps
  route("apps", "routes/apps.tsx"),

  // docs
  route("docs/create", "routes/docs/create.ts"),
  route("docs/:slug", "routes/docs/view.tsx"),
  route("docs/:slug/markdown", "routes/docs/markdown.tsx"),
  route("docs/:slug/edit", "routes/docs/edit.tsx"),

  // kioku
  route("kioku", "routes/kioku.tsx"),

  // you
  route("you", "routes/you.tsx"),

  // todo
  route("todo", "routes/todo.tsx"),

  // auth
  route("signin", "routes/signin.ts"),
  route("signout", "routes/signout.ts"),
  route("fileupload", "routes/fileupload.ts"),

  // SNS リダイレクト
  route("discord", "routes/discord.ts"),
  route("youtube", "routes/youtube.ts"),
  route("github", "routes/github.ts"),
  route("shop", "routes/shop.ts"),
  route("note", "routes/note.ts"),
] satisfies RouteConfig;
