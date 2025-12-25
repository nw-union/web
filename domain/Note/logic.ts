import type { NoteId, Url } from "../vo";
import type { Note } from "./type";

// ----------------------------------------------------------------------------
// Validator (DTO -> Domain Type)
// ----------------------------------------------------------------------------
// なし

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * Note を新規作成
 *
 * Logic Rules:
 *   - id, title, noteUserName, url, thumbnailUrl は入力値をそのまま使用
 *   - createdAt, updatedAt は引数 now となる
 */
export const createNote = ([id, title, noteUserName, url, thumbnailUrl, now]: [
  NoteId,
  string,
  string,
  Url,
  Url | null,
  Date,
]): Note => ({
  type: "Note",
  id,
  title,
  noteUserName,
  url,
  thumbnailUrl,
  createdAt: now,
  updatedAt: now,
});

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし
