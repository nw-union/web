import { fromShortUuid } from "@nw-union/nw-utils/lib/uuid";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
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

// FIXME: Meta Data

/**
 * ドキュメント編集 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const doc = loaderData;
  const [editorContent, setEditorContent] = useState<object | null>(null);

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
