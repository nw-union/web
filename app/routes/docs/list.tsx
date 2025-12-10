import type { DocInfo, SearchDocQuery } from "../../../type.ts";
import { ThemeToggle } from "../../components/ThemeToggle.tsx";
import { metaArray } from "../../util.ts";
import type { Route } from "./+types/list.ts";

/**
 * ドキュメント一覧 Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, repo, auth } = context;

  log.info("🔄 ドキュメント一覧 Loader");

  // ログイン状態の確認
  const q = await auth.auth(request).match(
    () => ({}) as SearchDocQuery,
    () => ({ statuses: ["public"] }) as SearchDocQuery,
  );

  // ドキュメント一覧を取得
  return await repo.searchDoc(q).match(
    (docs) => docs,
    (e) => {
      log.error("ドキュメント一覧の取得に失敗しました", e);
      return [] as DocInfo[]; // エラー時は空の配列を返す
    },
  );
}

export const meta = (_: Route.MetaArgs) =>
  metaArray({
    title: "Docs | NWU",
    desc: "役にたつドキュメントや、役にたたないエッセイ。",
  });

/**
 * ドキュメント一覧 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const docs = loaderData;

  return (
    <main className="bg-white dark:bg-gray-900 min-h-screen flex flex-col justify-start items-center p-8 pt-10 md:pt-16 mb-32 transition-colors duration-300 font-sg">
      <ThemeToggle />
      <div className="max-w-2xl w-full">
        <div className="my-20">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Docs
          </h1>
          <div className="text-xs text-center text-gray-800 dark:text-gray-300">
            役にたつドキュメントや、役にたたないエッセイ。
          </div>
        </div>

        <ul className="list-disc mb-4 ml-5 text-gray-700 dark:text-gray-300">
          {docs.map((doc: DocInfo) => (
            <li className="m-1 text-gray-700 dark:text-gray-300" key={doc.id}>
              <a
                className="text-blue-600 dark:text-cyan-400 hover:underline hover:text-blue-700 dark:hover:text-cyan-300"
                href={`/docs/${doc.slug}`}
              >
                {doc.title}
                {doc.status === "private" && " 🔒"}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
