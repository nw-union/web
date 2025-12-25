import { useState } from "react";
import { redirect } from "react-router";
import type { Kioku } from "../../type";
import { createMetaTags } from "../util";
import type { Route } from "./+types/kioku";

const NOTE_DEFAULT_THUMBNAIL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI2NzAiIHZpZXdCb3g9IjAgMCAxMjgwIDY3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzE4MV8zMjQpIj4KPHBhdGggZD0iTTAgMEgxMjgwVjY3MEgwVjBaIiBmaWxsPSIjRjVGOEZBIi8+CjxwYXRoIGQ9Ik02OTUuMyAyODMuMUg3MTkuOFYzMDkuNEg3NDVWMzMyLjRINzE5LjhWMzU5LjdINjk1LjNWMzMyLjRINjcwLjFWMzA5LjRINjk1LjNWMjgzLjFaIiBmaWxsPSIjREZFMkU0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNTM2LjggMzM5LjFDNTM2LjggMzEzIDU1Ny45IDI5MS44IDU4My44IDI5MS44QzYwOS43IDI5MS44IDYzMC44IDMxMyA2MzAuOCAzMzkuMUM2MzAuOCAzNjUuMiA2MDkuNyAzODYuNCA1ODMuOCAzODYuNEM1NTcuOSAzODYuNCA1MzYuOCAzNjUuMiA1MzYuOCAzMzkuMVpNNTU5LjIgMzM5QzU1OS4yIDM1Mi43IDU3MC4yIDM2My44IDU4My44IDM2My44QzU5Ny40IDM2My44IDYwOC40IDM1Mi44IDYwOC40IDMzOUM2MDguNCAzMjUuMyA1OTcuNCAzMTQuMiA1ODMuOCAzMTQuMkM1NzAuMiAzMTQuMiA1NTkuMiAzMjUuMyA1NTkuMiAzMzlaIiBmaWxsPSIjREZFMkU0Ii8+CjxwYXRoIGQ9Ik00MjQuNzk0IDI5Mi4yOTNDNDM3Ljk0MSAyOTIuMDQ4IDQ1MS42MTIgMjkxLjc5NSA0NjIuNiAyOTIuMUM0ODYuOCAyOTIuNyA0OTUuOSAzMDMuMiA0OTYuMyAzMjkuM0M0OTYuNiAzNDQgNDk2LjMgMzg2LjIgNDk2LjMgMzg2LjJINDcwLjFDNDcwLjEgMzcwLjUzOCA0NzAuMTM2IDM2MC40MjUgNDcwLjE2MiAzNTMuMDg1VjM1My4wNjhDNDcwLjE5OCAzNDMuMTI1IDQ3MC4yMTUgMzM4LjI3MyA0NzAuMSAzMzEuNkM0NjkuOCAzMjEuNCA0NjYuOSAzMTYuNSA0NTkgMzE1LjZDNDUwLjYgMzE0LjYgNDI3LjMgMzE1LjQgNDI3LjMgMzE1LjRWMzg2LjJINDAxLjFWMjkyLjZDNDA4LjIyNyAyOTIuNiA0MTYuNDAxIDI5Mi40NDggNDI0Ljc4OSAyOTIuMjkzTDQyNC43OTQgMjkyLjI5M1oiIGZpbGw9IiNERkUyRTQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04NzguNCAzMzkuMUM4NzguNCAzMTMgODU3LjMgMjkxLjggODMxLjQgMjkxLjhDODA1LjUgMjkxLjggNzg0LjQgMzEzIDc4NC40IDMzOS4xQzc4NC40IDM1NC40IDc5MS40IDM2Ny41IDgwMi4zIDM3Ni4yQzgwOS45IDM4Mi4yIDgyMC41IDM4Ni40IDgzNC43IDM4Ni40Qzg0MS42IDM4Ni40IDg1OS41IDM4NC41IDg3Mi40IDM3MC4yTDg2MS44IDM1NkM4NTcuMyAzNjAgODQ2IDM2NS42IDgzNyAzNjUuNkM4MjUuNiAzNjUuNiA4MTguNyAzNjMuNCA4MTMuNyAzNTguN0M4MTAuNiAzNTUuOSA4MDguNCAzNTEuNiA4MDcuNCAzNDYuM0g4NzcuN0M4NzguMSAzNDMuOSA4NzguNCAzNDEuNiA4NzguNCAzMzkuMVpNODA3LjYgMzMwLjVDODEwLjIgMzE5LjQgODE4IDMxMS4yIDgzMS4zIDMxMS4yQzg0NS4yIDMxMS4yIDg1Mi41IDMyMCA4NTQuOSAzMzAuNUg4MDcuNloiIGZpbGw9IiNERkUyRTQiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xODFfMzI0Ij4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNjcwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";

/**
 * キオク一覧 Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, wf, auth } = context;

  log.info("🔄 キオク一覧 Loader");

  // ログイン状態の確認
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    // signin して, kioku に戻ってくる
    return redirect("/signin?redirectUrl=/kioku");
  }

  // キオク一覧を取得
  return await wf.kioku.get().match(
    (kiokus) => ({ kiokus }),
    (e) => {
      log.error("キオク一覧の取得に失敗しました", e);
      return { kiokus: [] as Kioku[] }; // エラー時は空の配列を返す
    },
  );
}

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Kioku | NWU",
    description: "生きられた時間",
  });

function getCategoryLabel(category: Kioku["category"]) {
  switch (category) {
    case "doc":
      return "Doc";
    case "note":
      return "Note";
    case "youtube":
      return "YouTube";
    case "privateYoutube":
      return "Private";
    default:
      return category;
  }
}

function getCategoryIcon(category: Kioku["category"]) {
  switch (category) {
    case "doc":
      return (
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-label="Document"
        >
          <title>Document</title>
          <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16H5.75A1.75 1.75 0 014 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H5.75z" />
        </svg>
      );
    case "note":
      return (
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-label="Note"
        >
          <title>Note</title>
          <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0114.25 13H8.06l-2.573 2.573A1.458 1.458 0 013 14.543V13H1.75A1.75 1.75 0 010 11.25V1.75zm1.75-.25a.25.25 0 00-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.75.75 0 01.53-.22h6.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25H1.75z" />
        </svg>
      );
    case "youtube":
    case "privateYoutube":
      return (
        <svg
          className="w-3 h-3"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-label="Video"
        >
          <title>Video</title>
          <path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75zM6 10.559V5.442a.25.25 0 01.379-.215l4.264 2.559a.25.25 0 010 .428l-4.264 2.559A.25.25 0 016 10.559z" />
        </svg>
      );
  }
}

function KiokuCard({ kioku }: { kioku: Kioku }) {
  const thumbnailUrl =
    kioku.category === "note" && !kioku.thumbnailUrl
      ? NOTE_DEFAULT_THUMBNAIL
      : kioku.thumbnailUrl;

  return (
    <a
      href={kioku.url}
      {...(kioku.category !== "doc" && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
      className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        {kioku.category === "doc" && !kioku.thumbnailUrl ? (
          <div className="w-40 h-[90px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              role="img"
              aria-label="Document icon"
            >
              <title>Document icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        ) : (
          <img
            src={thumbnailUrl}
            alt={kioku.title}
            className="w-40 h-[90px] object-cover rounded-lg"
          />
        )}
        {kioku.duration && (
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {kioku.duration}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
          {kioku.title}
        </h3>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
          <p>{kioku.name}</p>
          <p className="flex items-center gap-1">
            {getCategoryIcon(kioku.category)}
            <span>{getCategoryLabel(kioku.category)}</span>
            <span>•</span>
            <span>{kioku.createdAt.toLocaleDateString("ja-JP")}</span>
          </p>
        </div>
      </div>
    </a>
  );
}

export default function Show({ loaderData }: Route.ComponentProps) {
  const { kiokus } = loaderData;
  const [selectedCategory, setSelectedCategory] = useState<
    Kioku["category"] | "all"
  >("all");

  const filteredKiokus =
    selectedCategory === "all"
      ? kiokus
      : selectedCategory === "youtube"
        ? kiokus.filter(
            (kioku) =>
              kioku.category === "youtube" ||
              kioku.category === "privateYoutube",
          )
        : kiokus.filter((kioku) => kioku.category === selectedCategory);

  const categories: Array<{ value: Kioku["category"] | "all"; label: string }> =
    [
      { value: "all", label: "All" },
      { value: "youtube", label: "YouTube" },
      { value: "note", label: "Note" },
      { value: "doc", label: "Doc" },
    ];

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="container mx-auto max-w-7xl px-4 py-4">
        <div className="my-8">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Kioku
          </h1>
          <div className="text-xs text-center text-gray-800 dark:text-gray-300">
            生きられた時間
          </div>
        </div>

        {/* Category Filter Tags */}
        <div className="flex flex-wrap justify-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-700">
          {categories.map((category) => (
            <button
              type="button"
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
                selectedCategory === category.value
                  ? "border-green-600 text-green-600 dark:border-green-400 dark:text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredKiokus.map((kioku) => (
            <KiokuCard key={kioku.id} kioku={kioku} />
          ))}
        </div>
      </main>
    </div>
  );
}
