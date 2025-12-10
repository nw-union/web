import { type Editor, useEditorState } from "@tiptap/react";
import { useCallback } from "react";

export function MenuBar({ editor }: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,
      };
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("画像のURLを入力してください");

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="pt-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isBold
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isStrike
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isCode
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isHeading1
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isHeading2
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isHeading3
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isBulletList
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isOrderedList
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isCodeBlock
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          {"{"}
          {"}"}
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200 ${
            editorState.isBlockquote
              ? "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700"
              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          }`}
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          ↵
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          画像
        </button>
      </div>
    </div>
  );
}
