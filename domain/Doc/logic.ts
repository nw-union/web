import { createDocId, type String1To100 } from "../vo";
import type { Doc } from "./type";

// ----------------------------------------------------------------------------
// Validator (DTO -> Domain Type)
// ----------------------------------------------------------------------------
// なし

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * Doc を新規作成
 *
 * Logic Rules:
 *   - title は 入力値の値となる
 *   - title を見出し1として body にセット
 *   - description, thumbnailUrl は null にセット
 *   - status は "private" にセット
 *   - createdAt, updatedAt は 引数 now となる
 */
export const createDoc = ([title, now]: [String1To100, Date]): Doc => ({
  type: "Doc",
  id: createDocId(),
  title,
  description: null,
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
  thumbnailUrl: null,
  createdAt: now,
  updatedAt: now,
});

/**
 * Docs を更新
 *
 * Logic Rules:
 *  - title, description, status, body を 引数の値で更新する
 *  - updatedAt は 引数 now となる
 */
export const updatedDoc = ([doc, title, description, status, body, now]: [
  Doc,
  String1To100,
  String1To100 | null,
  "public" | "private",
  string,
  Date,
]): Doc => ({
  ...doc,
  title,
  description,
  status,
  body,
  updatedAt: now,
});

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし
