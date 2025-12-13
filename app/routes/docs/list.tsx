import { toShortUuid } from "@nw-union/nw-utils/lib/uuid";
import { useEffect, useId, useRef, useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import type { Doc, DocInfo, SearchDocQuery } from "../../../type.ts";
import { ThemeToggle } from "../../components/ThemeToggle.tsx";
import { createMetaTags } from "../../util.ts";
import type { Route } from "./+types/list.ts";

/**
 * ドキュメント一覧 Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, repo, auth } = context;

  log.info("🔄 ドキュメント一覧 Loader");

  // ログイン状態の確認
  const userRes = await auth.auth(request);
  const isAuthenticated = userRes.isOk();

  const q: SearchDocQuery = userRes.isOk() ? {} : { statuses: ["public"] };

  // ドキュメント一覧を取得
  const docs = await repo.searchDoc(q).match(
    (docs) => docs,
    (e) => {
      log.error("ドキュメント一覧の取得に失敗しました", e);
      return [] as DocInfo[]; // エラー時は空の配列を返す
    },
  );

  return { docs, isAuthenticated };
}

/**
 * ドキュメント一覧 Action
 * 新規ドキュメント作成
 */
export async function action({ context, request }: Route.ActionArgs) {
  const { log, repo, auth } = context;

  log.info("🔄 ドキュメント作成 Action");

  // 認証チェック
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    return new Response("Unauthorized", { status: 401 });
  }

  // フォームデータを取得
  const formData = await request.formData();
  const title = formData.get("title") as string;

  if (!title || title.trim() === "") {
    log.error("タイトルが空です");
    return new Response("Bad Request", { status: 400 });
  }

  // 新規ドキュメントを作成
  const id = crypto.randomUUID();
  const now = new Date();
  const newDoc: Doc = {
    type: "Doc",
    id,
    title: title.trim(),
    description: "",
    status: "private",
    body: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: title.trim() }],
        },
        { type: "paragraph" },
      ],
    }),
    createdAt: now,
    updatedAt: now,
  };

  // DBに保存
  const result = await repo.upsertDoc(newDoc);
  if (result.isErr()) {
    log.error("ドキュメントの作成に失敗しました", result.error);
    return new Response("Internal Server Error", { status: 500 });
  }

  // ShortUUIDに変換して編集ページにリダイレクト
  const slugRes = toShortUuid(id);
  if (slugRes.isErr()) {
    log.error("SlugへのUUID変換に失敗しました");
    return new Response("Internal Server Error", { status: 500 });
  }

  log.info(`ドキュメントを作成しました: ${id}`);
  return redirect(`/docs/${slugRes.value}/edit`);
}

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Docs | NWU",
    description: "役にたつドキュメントや、役にたたないエッセイ。",
  });

/**
 * ドキュメント一覧 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const { docs, isAuthenticated } = loaderData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const titleId = useId();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // モーダルが開いたときにタイトル入力欄にフォーカス
  useEffect(() => {
    if (isModalOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isModalOpen]);

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
          {isAuthenticated && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 dark:text-cyan-400 hover:underline hover:text-blue-700 dark:hover:text-cyan-300 text-xs cursor-pointer bg-transparent border-none"
              >
                ドキュメント新規作成
              </button>
            </div>
          )}
        </div>

        <ul className="list-disc mb-4 ml-5 text-gray-700 dark:text-gray-300">
          {docs.map((doc: DocInfo) => (
            <li className="m-1 text-gray-700 dark:text-gray-300" key={doc.id}>
              <Link
                className="text-blue-600 dark:text-cyan-400 hover:underline hover:text-blue-700 dark:hover:text-cyan-300"
                to={`/docs/${doc.slug}`}
              >
                {doc.title}
                {doc.status === "private" && " 🔒"}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 新規作成モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              新規ドキュメント作成
            </h2>
            <Form
              method="post"
              onSubmit={() => {
                setIsModalOpen(false);
                setTitle("");
              }}
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={titleId}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    タイトル
                  </label>
                  <input
                    type="text"
                    id={titleId}
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    ref={titleInputRef}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="タイトルを入力"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setTitle("");
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg border border-gray-400 dark:border-gray-600 transition-colors duration-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg border border-blue-700 dark:border-blue-800 transition-colors duration-200"
                >
                  {isSubmitting ? "作成中..." : "作成"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </main>
  );
}
