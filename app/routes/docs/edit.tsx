import { fromShortUuid } from "@nw-union/nw-utils/lib/uuid";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { Form, useNavigation } from "react-router";
import { MenuBar } from "../../components/EditorMenuBar.tsx";
import { ThemeToggle } from "../../components/ThemeToggle.tsx";
import type { Route } from "./+types/view.ts";

/**
 * ドキュメント編集 Loader
 *
 */
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { log, repo, auth } = context;

  log.info(`🔄 ドキュメント編集 Loader. slug: ${params.slug}`);

  // 認証チェック
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    return new Response("Unauthorized", { status: 401 });
  }

  const idRes = fromShortUuid(params.slug);
  if (idRes.isErr()) {
    log.error(`Invalid slug: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }
  const id = idRes.value;

  return await repo.readDoc(id).match(
    (doc) => doc,
    (e) => {
      log.error("ドキュメントの取得に失敗しました", e);
      return new Response("Not Found", { status: 404 });
    },
  );
}

/**
 * ドキュメント編集 Action
 *
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  const { log, repo } = context;

  log.info(`🔄 ドキュメント編集 Action. slug: ${params.slug}`);
  const idRes = fromShortUuid(params.slug);
  if (idRes.isErr()) {
    log.error(`Invalid slug: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }
  const id = idRes.value;

  // ドキュメントを取得
  const docRes = await repo.readDoc(id);
  if (docRes.isErr()) {
    log.error("ドキュメントの取得に失敗しました", docRes.error);
    return new Response("Not Found", { status: 404 });
  }
  const doc = docRes.value;

  // フォームデータを取得
  const formData = await request.formData();
  const body = formData.get("body") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!body) {
    log.error("ドキュメント本文が空です");
    return new Response("Bad Request", { status: 400 });
  }

  if (!title) {
    log.error("タイトルが空です");
    return new Response("Bad Request", { status: 400 });
  }

  // ドキュメントを更新
  const updatedDocRes = await repo.upsertDoc({
    ...doc,
    title,
    description,
    body,
    updatedAt: new Date(),
  });
  if (updatedDocRes.isErr()) {
    log.error("ドキュメントの更新に失敗しました", updatedDocRes.error);
    return new Response("Internal Server Error", { status: 500 });
  }

  log.info("ドキュメントを更新しました");
  return { success: true };
}

/**
 * ドキュメント編集 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const doc = loaderData;
  const [editorContent, setEditorContent] = useState<object | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // tiptap エディタの初期化
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: true, // 閲覧モードのため編集不可
    immediatelyRender: false, // SSR環境での水和ミスマッチを回避
    editorProps: {
      attributes: {
        class: "outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getJSON());
    },
  });

  // ドキュメントの body を JSON としてパースしてエディタに設定
  useEffect(() => {
    if (editor && doc.body) {
      try {
        const content = JSON.parse(doc.body);
        editor.commands.setContent(content);
        setEditorContent(content);
      } catch (error) {
        console.error("Failed to parse document body:", error);
      }
    }
  }, [editor, doc.body]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700">
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {editor && (
          <>
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 -mx-4 px-4">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <MenuBar editor={editor} />
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
            <div className="md-body">
              <EditorContent editor={editor} />
            </div>

            {/* 保存モーダル */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    ドキュメントを保存
                  </h2>
                  <Form method="post" onSubmit={() => setIsModalOpen(false)}>
                    <input
                      type="hidden"
                      name="body"
                      value={editorContent ? JSON.stringify(editorContent) : ""}
                    />
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          タイトル
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          説明
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSubmitting ? "保存中..." : "保存"}
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <details className="cursor-pointer">
          <summary className="font-medium text-gray-700 dark:text-gray-300 mb-2">
            JSON データを表示
          </summary>
          <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(editorContent, null, 2)}
          </code>
        </details>
      </div>
    </div>
  );
}
