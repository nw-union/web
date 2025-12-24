import type { AppError } from "@nw-union/nw-utils";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import { match } from "ts-pattern";
import type { UserWorkFlows } from "../../type";
import { type Email, newEmail, type TimePort } from "../vo";
import { convToUserDto, createUser } from "./logic";
import type { UserRepositoryPort } from "./port";
import type { User } from "./type";

export const newUserWorkFlows = (
  r: UserRepositoryPort,
  t: TimePort,
): UserWorkFlows => ({
  /*
   * ユーザーを取得する
   */
  get: (q) =>
    okAsync(q.email)
      // Email 検証
      .andThen(newEmail)
      // ユーザー取得する. 存在しなければ作成する
      .andThen(getOrCreateUser(r, t)(q.id))
      // DTO 変換
      .map(convToUserDto)
      // イベント生成
      .map((user) => ({ user })),
});

const getOrCreateUser =
  (r: UserRepositoryPort, t: TimePort) =>
  (id: string) =>
  (email: Email): ResultAsync<User, AppError> =>
    r.read(id).orElse((err) =>
      match(err)
        // ユーザーが存在しない場合は新規作成
        .with({ name: "NotFoundError" }, () =>
          // 現在時刻取得
          t
            .getNow()
            // ユーザー作成
            .map((now) => createUser([id, email, now]))
            // DB保存
            .andThrough(r.upsert),
        )
        // その他のエラーはそのまま返す
        .otherwise(() => errAsync(err)),
    );
