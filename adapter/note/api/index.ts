import { AppError, type Logger, SystemError } from "@nw-union/nw-utils";
import { fromPromise, type ResultAsync } from "neverthrow";
import { match, P } from "ts-pattern";
import type { NotePort } from "../../../domain/Note/port";
import type { NoteInfo } from "../../../domain/Note/type";

// ----------------------------------------------------------------------------
// DTO (Note API Response Type)
// ----------------------------------------------------------------------------
// type NoteApiResponse = {
//   title: string;
//   user: {
//     name: string;
//   };
//   url: string;
//   thumbnailUrl: string | null;
// };

// ----------------------------------------------------------------------------
// Utility
// ----------------------------------------------------------------------------
const noteErrorHandling = (e: unknown): AppError =>
  match(e)
    .with(P.instanceOf(AppError), (e) => e)
    .with(P.instanceOf(Error), (e) => new SystemError(e.message, [], e))
    .otherwise((e) => new SystemError(`note unknown error. error: ${e}`));

// ----------------------------------------------------------------------------
// Adapter Logic
// ----------------------------------------------------------------------------
const fetchInfo =
  (log: Logger) =>
  (noteId: string, _userId: string): ResultAsync<NoteInfo, AppError> =>
    fromPromise(
      (async () => {
        log.info("📝 Note API fetchInfo 開始");
        log.debug(`noteId: ${noteId}`);

        // TODO: note.com の API または埋め込み URL から情報を取得する実装
        // 現在は未実装のため、エラーを返す
        throw new SystemError(
          "Note API の実装は未完成です。現在は mock アダプターを使用してください。",
        );

        // 以下は実装例 (実際の API エンドポイントは未確認)
        // const response = await fetch(
        //   `https://note.com/api/v2/notes/${noteId}`,
        // );
        // if (!response.ok) {
        //   throw new SystemError(
        //     `Note API リクエストに失敗しました: ${response.status} ${response.statusText}`,
        //   );
        // }
        //
        // const data = (await response.json()) as NoteApiResponse;
        //
        // return {
        //   type: "NoteInfo",
        //   title: data.title,
        //   noteUserName: data.user.name,
        //   url: data.url,
        //   thumbnailUrl: data.thumbnailUrl,
        // };
      })(),
      noteErrorHandling,
    );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newNoteApi = (log: Logger): NotePort => ({
  fetchInfo: fetchInfo(log),
});
