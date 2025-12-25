import { okAsync, ResultAsync } from "neverthrow";
import type { NoteWorkFlows } from "../../type";
import type { TimePort } from "../port";
import { newNoteId, newUrl, newUrlOrNone } from "../vo";
import { createNote } from "./logic";
import type { NoteRepositoryPort } from "./port";

export const newNoteWorkFlows = (
  r: NoteRepositoryPort,
  t: TimePort,
): NoteWorkFlows => ({
  /**
   * Note 作成
   */
  create: ({ id, title, noteUserName, url, thumbnailUrl }) =>
    // Step.1 検証 & 現在日時取得
    //   string -> [NoteId, string, string, Url, Url | null, Date]
    ResultAsync.combine([
      // SubStep.1 NoteId 検証 (UUID)
      okAsync(id).andThen(newNoteId),
      // SubStep.2 Title と noteUserName はそのまま
      okAsync(title),
      okAsync(noteUserName),
      // SubStep.3 URL 検証 (必須)
      okAsync(url).andThen(newUrl),
      // SubStep.4 ThumbnailUrl 検証 (オプショナル)
      okAsync(thumbnailUrl).andThen(newUrlOrNone),
      // SubStep.5 現在日時取得
      t.getNow(),
    ])
      // Step.2 Note 作成
      //   [NoteId, string, string, Url, Url | null, Date] -> Note
      .map(createNote)
      // Step.3 Note 保存
      .andThrough(r.upsert)
      // Step.4 イベント生成
      .map((note) => ({ id: note.id })),
});
