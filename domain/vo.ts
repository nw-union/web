import type { AppError, ValidationError } from "@nw-union/nw-utils";
import { uuidv4 } from "@nw-union/nw-utils/lib/uuid";
import { newType } from "@nw-union/nw-utils/lib/zod";
import { ok, type Result, type ResultAsync } from "neverthrow";
import { z } from "zod";

/**
 * newVoOrNone は, ValueObjectを生成する関数を作成するためのヘルパー関数
 * 入力文字列が空文字の場合は, null. それ以外は `newVo` と同様に動作する関数を作成する
 *
 * @param schema zodのスキーマ
 * @param type VOの型名
 */
const newVoOrNone =
  <T extends z.ZodTypeAny>(schema: T, type: string) =>
  (src: unknown, name?: string): Result<z.infer<T> | null, ValidationError> =>
    src === "" ? ok(null) : newType(schema, type)(src, name);

// -------

/**
 * DocId
 *
 * UUID `z.uuidv4()`
 */
const docId = z.uuidv4().brand("DocId"); // UUID
export type DocId = z.infer<typeof docId>;
export const newDocId = newType(docId, "DocId");
export const createDocId = () => newDocId(uuidv4())._unsafeUnwrap();

/**
 * VideoId
 *
 * UUID `z.uuidv4()`
 */
const videoId = z.uuidv4().brand("VideoId"); // UUID
export type VideoId = z.infer<typeof videoId>;
export const newVideoId = newType(docId, "VideoId");
export const createVideoId = () => newDocId(uuidv4())._unsafeUnwrap();

/**
 * String1To100 1文字以上100文字以下の文字列が入る型
 *
 * `z.string().min(1).max(100)`
 */
const string1To100 = z.string().min(1).max(100).brand("String1To100");
export type String1To100 = z.infer<typeof string1To100>;
export const newString1To100 = newType(string1To100, "String1To100");
export const newString1To100OrNone = newVoOrNone(string1To100, "String1To100");

/**
 * Url
 *
 * `z.url()`
 */
const url = z.url().brand("Url");
export type Url = z.infer<typeof url>;
export const newUrl = newType(url, "Url");
export const newUrlOrNone = newVoOrNone(url, "Url");

/**
 * Email
 *
 * `z.string().email()`
 */
const email = z.string().email().brand("Email");
export type Email = z.infer<typeof email>;
export const newEmail = newType(email, "Email");

/**
 * 時間関連ポート
 */
export interface TimePort {
  // 現在日時取得
  getNow(): ResultAsync<Date, AppError>;
}
