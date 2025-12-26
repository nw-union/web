import { type JSX, useState } from "react";
import { redirect } from "react-router";
import { match } from "ts-pattern";
import type { Kioku } from "../../type";
import { DocumentIcon, NoteIcon, YouTubeIcon } from "../components/Icons";
import { createMetaTags } from "../util";
import type { Route } from "./+types/kioku";

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
    // ログインしてない場合は signin して, kioku に戻ってくる
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

/**
 * メタタグ設定
 */
export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Kioku | NWU",
    description: "生きられた時間",
  });

/**
 * カテゴリーラベルを取得
 *
 * @param category カテゴリー
 * @returns ラベル string
 */
const getCategoryLabel = (category: Kioku["category"]): string =>
  match(category)
    .with("doc", () => "Doc")
    .with("note", () => "note")
    .with("youtube", () => "YouTube")
    .with("privateYoutube", () => "Private")
    .exhaustive();

/**
 * カテゴリーアイコンを取得
 *
 * @param category カテゴリー
 * @param className クラス名
 *
 * @returns アイコン JSX.Element
 */
const getCategoryIcon = (
  category: Kioku["category"],
  className: string,
): JSX.Element =>
  match(category)
    .with("doc", () => <DocumentIcon className={className} />)
    .with("note", () => <NoteIcon className={className} />)
    .with("youtube", "privateYoutube", () => (
      // YouTube も Private も同じアイコン
      <YouTubeIcon className={className} />
    ))
    .exhaustive();

const KiokuCard = ({ kioku }: { kioku: Kioku }): JSX.Element => (
  <a
    href={kioku.url}
    {...(kioku.category !== "doc" && {
      target: "_blank",
      rel: "noopener noreferrer",
    })}
    className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
  >
    {/* ---------------- サムネイル画像表示 ---------------- */}
    <div className="relative flex-shrink-0">
      {!kioku.thumbnailUrl ? (
        <div className="w-40 h-[90px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {getCategoryIcon(
            kioku.category,
            "w-12 h-12 text-gray-400 dark:text-gray-500",
          )}
        </div>
      ) : (
        <img
          src={kioku.thumbnailUrl}
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

    {/* ---------------- 情報エリア ---------------- */}
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
        {kioku.title}
      </h3>
      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
        <p>{kioku.name}</p>
        <p className="flex items-center gap-1">
          {getCategoryIcon(kioku.category, "w-3 h-3")}
          <span>{getCategoryLabel(kioku.category)}</span>
          <span>•</span>
          <span>{kioku.createdAt.toLocaleDateString("ja-JP")}</span>
        </p>
      </div>
    </div>
  </a>
);

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
      { value: "note", label: "note" },
      { value: "doc", label: "Doc" },
    ];

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="container mx-auto max-w-7xl px-4 py-4">
        {/* ---------------- タイトル ---------------- */}
        <div className="my-8">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Kioku
          </h1>
          <div className="text-xs text-center text-gray-800 dark:text-gray-300">
            生きられた時間
          </div>
        </div>

        {/* ---------------- Category Filter Tags ---------------- */}
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

        {/* ---------------- キオクカード一覧エリア ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filteredKiokus.map((kioku) => (
            <KiokuCard key={kioku.id} kioku={kioku} />
          ))}
        </div>
      </main>
    </div>
  );
}
