import { toShortUuid } from "@nw-union/nw-utils/lib/uuid";
import { useEffect, useId, useRef, useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import type { DocInfo, SearchDocQuery } from "../../../type";
import { createMetaTags } from "../../util";
import type { Route } from "./+types/list";

/**
 * ドキュメント一覧 Loader
 *
 */
export async function loader({ context, request }: Route.LoaderArgs) {
  const { log, auth, wf } = context;

  log.info("🔄 ドキュメント一覧 Loader");

  // ログイン状態の確認
  const userRes = await auth.auth(request);
  const isAuthenticated = userRes.isOk();

  const q: SearchDocQuery = userRes.isOk() ? {} : { statuses: ["public"] };

  // ドキュメント一覧を取得
  const docs = await wf.doc.search(q).match(
    (evt) => evt.docs,
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
  const { log, wf, auth } = context;

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
  return (
    await wf.doc.create({
      title: title,
      userId: userRes.value,
    })
  ).match(
    ({ id }) => {
      const slugRes = toShortUuid(id);
      if (slugRes.isErr()) {
        log.error("SlugへのUUID変換に失敗しました");
        return new Response("Internal Server Error", { status: 500 });
      }
      return redirect(`/docs/${slugRes.value}/edit`);
    },
    (e) => {
      log.error("ドキュメントの作成に失敗しました", e);
      return new Response("Internal Server Error", { status: 500 });
    },
  );
}

export const meta = (_: Route.MetaArgs) =>
  createMetaTags({
    title: "Docs | NWU",
    description: "Watch NWU videos and movies",
  });

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

function DocCard({ doc }: { doc: DocInfo }) {
  return (
    <Link
      to={`/docs/${doc.slug}`}
      className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
    >
      <div className="relative flex-shrink-0">
        {doc.thumbnailUrl ? (
          <img
            src={doc.thumbnailUrl}
            alt={doc.title}
            className="w-40 h-[90px] object-cover rounded-lg"
          />
        ) : (
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
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-1">
          {doc.title}
        </h3>
        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
          <p>grandcolline</p>
          <p className="flex items-center gap-1">
            {doc.status === "public" ? (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  role="img"
                  aria-label="Public video"
                >
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM5.78 8.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Zm4.5-4.5c.274 0 .537.038.787.11C7.663 2.288 9.388 1.5 11 1.5c.274 0 .537.038.787.11-.876 1.322-2.601 2.11-4.213 2.11-.274 0-.537-.038-.787-.11C5.913 4.932 4.188 5.72 2.576 5.72c-.274 0-.537-.038-.787-.11.876-1.322 2.601-2.11 4.213-2.11Z" />
                </svg>
                <span>Public</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  role="img"
                  aria-label="Private video"
                >
                  <path d="M8 1a2 2 0 0 1 2 2v3h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1V3a2 2 0 0 1 2-2Zm0 1a1 1 0 0 0-1 1v3h2V3a1 1 0 0 0-1-1Z" />
                </svg>
                <span>Private</span>
              </>
            )}
            <span>•</span>
            <span>{formatDate(doc.createdAt)}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function Show({ loaderData }: Route.ComponentProps) {
  const { docs, isAuthenticated } = loaderData;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const titleId = useId();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // PWAのスタンドアローンモードを検出
  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone: boolean }).standalone === true);
    setIsStandalone(isStandaloneMode);
  }, []);

  // モーダルが開いたときにタイトル入力欄にフォーカス
  useEffect(() => {
    if (isModalOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isModalOpen]);

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="container mx-auto max-w-7xl px-4 py-4">
        <div className="my-16">
          <h1 className="text-2xl py-2 font-medium text-center text-gray-800 dark:text-gray-300">
            Docs
          </h1>
          <div className="text-xs text-center text-gray-800 dark:text-gray-300">
            役にたつドキュメントや、役にたたないエッセイ。
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      </main>

      {/* 新規作成ボタン（フローティング） */}
      {isAuthenticated && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`fixed ${isStandalone ? "bottom-26" : "bottom-20"} right-6 w-12 h-12 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border border-gray-400 dark:border-gray-600 z-40 hover:scale-110`}
          aria-label="新規ドキュメント作成"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <title>新規作成</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      )}

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
    </div>
  );
}
