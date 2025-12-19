import { type Editor, useEditorState } from "@tiptap/react";
import { useCallback } from "react";

// スタイルをヘルパー関数で共通化
const getButtonClassName = (isActive: boolean, isDisabled = false) => {
  const baseClasses =
    "px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200";
  const activeClasses =
    "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700";
  const inactiveClasses =
    "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700";
  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed";

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isDisabled ? disabledClasses : ""}`;
};

interface EditorButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const EditorButton = ({
  onClick,
  isActive,
  disabled = false,
  children,
}: EditorButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={getButtonClassName(isActive, disabled)}
  >
    {children}
  </button>
);

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
    <div className="pt-1">
      <div className="flex flex-wrap gap-2">
        <EditorButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editorState.isBold}
          disabled={!editorState.canBold}
        >
          B
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editorState.isStrike}
          disabled={!editorState.canStrike}
        >
          S
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editorState.isCode}
          disabled={!editorState.canCode}
        >
          &lt;/&gt;
        </EditorButton>
        <EditorButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editorState.isHeading1}
        >
          H1
        </EditorButton>
        <EditorButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editorState.isHeading2}
        >
          H2
        </EditorButton>
        <EditorButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editorState.isHeading3}
        >
          H3
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editorState.isBulletList}
        >
          •
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editorState.isOrderedList}
        >
          1.
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editorState.isCodeBlock}
        >
          {"{"}
          {"}"}
        </EditorButton>
        <EditorButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editorState.isBlockquote}
        >
          "
        </EditorButton>
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
