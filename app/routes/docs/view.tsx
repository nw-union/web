import { fromShortUuid } from "@nw-union/nw-utils/lib/uuid";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Link } from "react-router";
import { createMetaTags } from "../../util";
import type { Route } from "./+types/view.ts";

/**
 * ドキュメント詳細 Loader
 *
 */
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { log, repo, auth } = context;

  log.info(`🔄 ドキュメント詳細 Loader. slug: ${params.slug}`);
  const isLogin = (await auth.auth(request)).isOk();

  const idRes = fromShortUuid(params.slug);
  if (idRes.isErr()) {
    log.error(`Invalid slug: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }
  const id = idRes.value;

  const docRes = await repo.readDoc(id);
  if (docRes.isErr()) {
    log.error(`ドキュメントの取得に失敗しました: ${params.slug}`, docRes.error);
    return new Response("Not Found", { status: 404 });
  }
  const doc = docRes.value;

  if (!isLogin && doc.status !== "public") {
    log.warn(`Unauthorized access to private document: ${params.slug}`);
    return new Response("Not Found", { status: 404 });
  }

  return { doc, isLogin, slug: params.slug };
}

export const meta = ({ loaderData }: Route.MetaArgs) => {
  return createMetaTags({
    title: `${loaderData.doc.title} | NWU`,
    description: loaderData.doc.description || undefined,
  });
};

/**
 * ドキュメント詳細 Show
 *
 */
export default function Show({ loaderData }: Route.ComponentProps) {
  const { doc, isLogin, slug } = loaderData;

  // tiptap エディタの初期化
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Dropcursor,
    ],
    content: "",
    editable: false, // 閲覧モードのため編集不可
    immediatelyRender: false, // SSR環境での水和ミスマッチを回避
  });

  // ドキュメントの body を JSON としてパースしてエディタに設定
  useEffect(() => {
    if (editor && doc.body) {
      try {
        const content = JSON.parse(doc.body);
        editor.commands.setContent(content);
      } catch (error) {
        console.error("Failed to parse document body:", error);
      }
    }
  }, [editor, doc.body]);

  return (
    <div className="min-h-screen pb-20 bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700">
        {isLogin && (
          <Link
            to={`/docs/${slug}/edit`}
            className="fixed top-4 right-16 z-50 inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-400 dark:border-gray-600"
            aria-label="ドキュメントを編集"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </Link>
        )}
      </header>

      <main className="w-full md:w-[700px] mx-auto px-6 py-8">
        <div className="md-body">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
