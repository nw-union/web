import { okAsync, ResultAsync } from "neverthrow";
import type { DocWorkFlows } from "../../type";
import type { TimePort } from "../port";
import {
  newDocId,
  newString1To100,
  newString1To100OrNone,
  newUserId,
} from "../vo";
import { createDoc, updatedDoc } from "./logic";
import type { DocRepositoryPort } from "./port";

export const newDocWorkFlows = (
  r: DocRepositoryPort,
  t: TimePort,
): DocWorkFlows => ({
  /**
   * ドキュメント作成
   */
  create: ({ title, userId }) =>
    // Step.1 検証 & 現在日時取得
    //   string -> [String1To100, UserId, Date]
    ResultAsync.combine([
      // SubStep.1 タイトル検証
      //   string -> String1To100
      okAsync(title).andThen(newString1To100),
      // SubStep.2 ユーザーID検証
      //   string -> UserId
      okAsync(userId).andThen(newUserId),
      // SubStep.3 現在日時取得
      //   -> Date
      t.getNow(),
    ])
      // Step.2 ドキュメント作成
      //   [String1To100, UserId, Date] -> Doc
      .map(createDoc)
      // Step.3 ドキュメント保存
      .andThrough(r.upsert)
      // Step.4 イベント生成
      .map((doc) => ({ id: doc.id })),

  /**
   * ドキュメント編集
   */
  update: (cmd) =>
    ResultAsync.combine([
      // 既存のドキュメントを取得
      okAsync(cmd.id)
        .andThen(newDocId)
        .andThen(r.read),
      // タイトル検証
      okAsync(cmd.title).andThen(newString1To100),
      // Description検証
      okAsync(cmd.description).andThen(newString1To100OrNone),
      // ステータス
      okAsync(cmd.status),
      // 本文
      okAsync(cmd.body),
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
});
