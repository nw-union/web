import { okAsync, ResultAsync } from "neverthrow";
import type { DocWorkFlows } from "../../type";
import {
  newDocId,
  newString1To100,
  newString1To100OrNone,
  type TimePort,
} from "../vo";
import { createDoc, updatedDoc } from "./logic";
import type { DocRepositoryPort } from "./port";

export const newDocWorkFlows = (
  r: DocRepositoryPort,
  t: TimePort,
): DocWorkFlows => ({
  /*
   * ドキュメント作成
   **/
  create: ({ title }) =>
    ResultAsync.combine([
      // タイトル検証
      okAsync(title).andThen(newString1To100),
      // 現在日時取得
      t.getNow(),
    ])
      // ドキュメント作成
      .map(createDoc)
      // ドキュメント保存
      .andThrough(r.upsert)
      // イベント生成
      .map((doc) => ({ id: doc.id })),

  /*
   * ドキュメントを編集する
   */
  update: ({ id, title, description, status, body }) =>
    ResultAsync.combine([
      okAsync(id).andThen(newDocId).andThen(r.read),
      // タイトル検証
      okAsync(title).andThen(newString1To100),
      // Description検証
      okAsync(description).andThen(newString1To100OrNone),
      // ステータス
      okAsync(status),
      // 本文
      okAsync(body),
      // 現在日時取得
      t.getNow(),
    ])
      // ドキュメント更新
      .map(updatedDoc)
      // ドキュメント保存
      .andThen(r.upsert),

  /*
   * ドキュメントを見る
   */
  get: (q) =>
    okAsync(q)
      .andThen(r.get)
      .map((doc) => ({ doc })),

  /*
   * ドキュメントを探す
   */
  search: (q) =>
    okAsync(q)
      .andThen(r.search)
      .map((docs) => ({ docs })),
});
