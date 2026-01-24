import { fromShortUuid } from "@nw-union/nw-utils/lib/uuid";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef, useState } from "react";
import { Form, redirect, useNavigation } from "react-router";
import type { UpdateDocCmd } from "../../../type.ts";
import { MenuBar } from "../../components/EditorMenuBar.tsx";
import type { Route } from "./+types/edit.ts";

/**
 * ドキュメント編集 Loader
 *
 */
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { log, wf, auth } = context;

  log.info(`🔄 ドキュメント編集 Loader. slug: ${params.slug}`);

  // 認証チェック
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    return new Response("Unauthorized", { status: 401 });
  }

  // URLパラメータから ドキュメントの ID を取得
  const idRes = fromShortUuid(params.slug);
  if (idRes.isErr()) {
    log.error(`Invalid slug: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }
  const id = idRes.value;

  // ドキュメントを取得
  return await wf.doc.get({ id }).match(
    (evt) => ({ doc: evt.doc }),
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
  const { log, wf, auth } = context;

  log.info(`🔄 ドキュメント編集 Action. slug: ${params.slug}`);

  // 認証チェック
  const userRes = await auth.auth(request);
  if (userRes.isErr()) {
    log.error("認証に失敗しました", userRes.error);
    return new Response("Unauthorized", { status: 401 });
  }
  const user = userRes.value;

  const idRes = fromShortUuid(params.slug);
  if (idRes.isErr()) {
    log.error(`Invalid slug: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }
  const id = idRes.value;

  // フォームデータを取得
  const formData = await request.formData();
  const body = formData.get("body") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;

  // コマンド作成
  const cmd: UpdateDocCmd = {
    id,
    title,
    body,
    description: description || "",
    status: status as "public" | "private",
    thumbnailUrl: thumbnailUrl || "",
    userId: user.id, // update時は無視されるが、認証されたユーザーIDを設定
  };

  // ドキュメントを編集
  return await wf.doc.update(cmd).match(
    () => redirect(`/docs/${params.slug}`),
    (e) => {
      log.error("ドキュメントの更新に失敗しました", e);
      return new Response("Internal Server Error", { status: 500 });
    },
  );
}

/**
 * ドキュメント編集 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const { doc } = loaderData;
  const [editorContent, setEditorContent] = useState<object | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description);
  const [status, setStatus] = useState(doc.status);
  const [thumbnailUrl, setThumbnailUrl] = useState(doc.thumbnailUrl || "");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const thumbnailUrlId = useId();
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // tiptap エディタの初期化
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        resize: {
          enabled: true,
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          alwaysPreserveAspectRatio: true,
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Dropcursor,
    ],
    content: "",
    editable: true,
    immediatelyRender: false, // SSR環境での水和ミスマッチを回避
    editorProps: {
      attributes: {
        class: "tiptap outline-none focus:outline-none",
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
        // Safari でのスクロール問題を回避: レンダリング完了後にスクロールをリセット
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo(0, 0);
          });
        });
      } catch (error) {
        console.error("Failed to parse document body:", error);
      }
    }
  }, [editor, doc.body]);

  // サムネイル画像選択ダイアログを開く
  const handleThumbnailIconClick = () => {
    thumbnailFileInputRef.current?.click();
  };

  // サムネイル画像ファイル選択時の処理
  const handleThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイル形式の検証
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      alert("PNG, JPEG, JPG形式の画像のみアップロード可能です");
      if (thumbnailFileInputRef.current) {
        thumbnailFileInputRef.current.value = "";
      }
      return;
    }

    // ファイルサイズの検証（3MB）
    if (file.size > 1024 * 1024 * 3) {
      alert("ファイルサイズは3MB以下にしてください");
      if (thumbnailFileInputRef.current) {
        thumbnailFileInputRef.current.value = "";
      }
      return;
    }

    // ファイルを /fileupload にアップロード
    setIsUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/fileupload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const result = (await response.json()) as { url: string };
      const imgUrl = result.url;

      // 取得したURLをサムネイルURLフィールドに設定
      setThumbnailUrl(imgUrl);
      setIsUploadingThumbnail(false);
    } catch (_error) {
      alert("画像のアップロードに失敗しました");
      setIsUploadingThumbnail(false);
    } finally {
      if (thumbnailFileInputRef.current) {
        thumbnailFileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <main className="w-full md:w-[700px] mx-auto px-6 py-8">
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
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg border border-blue-700 dark:border-blue-800 transition-colors duration-200 whitespace-nowrap"
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={descriptionId}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          説明
                        </label>
                        <textarea
                          id={descriptionId}
                          name="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={statusId}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          ステータス
                        </label>
                        <select
                          id={statusId}
                          name="status"
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as typeof status)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required
                        >
                          <option value="public">公開</option>
                          <option value="private">メンバー限定</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor={thumbnailUrlId}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          サムネイルURL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            id={thumbnailUrlId}
                            name="thumbnailUrl"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={handleThumbnailIconClick}
                            disabled={isUploadingThumbnail}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-md border border-gray-400 dark:border-gray-600 transition-colors duration-200 whitespace-nowrap"
                          >
                            {isUploadingThumbnail
                              ? "アップロード中..."
                              : "画像選択"}
                          </button>
                        </div>
                        <input
                          ref={thumbnailFileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleThumbnailFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg border border-gray-400 dark:border-gray-600 transition-colors duration-200"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg border border-blue-700 dark:border-blue-800 transition-colors duration-200"
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

      <div className="w-full md:w-[700px] mx-auto px-6 pb-8">
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
