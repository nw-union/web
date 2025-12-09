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
export async function loader({ context, params }: Route.LoaderArgs) {
  const { log, repo } = context;

  log.info(`🔄 ドキュメント編集 Loader. slug: ${params.slug}`);
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

  if (!body) {
    log.error("ドキュメント本文が空です");
    return new Response("Bad Request", { status: 400 });
  }

  // ドキュメントを更新
  const updatedDocRes = await repo.upsertDoc({
    ...doc,
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
        {editor && <MenuBar editor={editor} />}
        <div className="md-body">
          <EditorContent editor={editor} />
        </div>

        <Form method="post" className="mt-8">
          <input
            type="hidden"
            name="body"
            value={editorContent ? JSON.stringify(editorContent) : ""}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </Form>
      </main>
      <hr className="my-16" />
      <div className="max-w-4xl mx-auto px-4 py-4">
        <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
          {JSON.stringify(editorContent)}
        </code>
      </div>
    </div>
  );
}
