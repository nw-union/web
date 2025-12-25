import type { Logger } from "@nw-union/nw-utils";
import { desc, type InferSelectModel } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { fromPromise, okAsync } from "neverthrow";
import type { NoteKiokuRepositoryPort } from "../../domain/Kioku/port";
import type { NoteKioku } from "../../domain/Kioku/type";
import { noteTable } from "./schema";
import { dbErrorHandling } from "./util";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type NoteSelectModel = InferSelectModel<typeof noteTable>;
// type NoteInsertModel = InferInsertModel<typeof noteTable>;

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし

// ----------------------------------------------------------------------------
// Validator (DTO -> Domain Type / DTO -> DTO)
// ----------------------------------------------------------------------------
// NoteSelectModel を KiokuDto に変換
const validateKiokuDto = (n: NoteSelectModel): NoteKioku => ({
  type: "NoteKioku",

  id: n.id,
  title: n.title,
  noteUserName: n.noteUserName,
  thumbnailUrl: n.thumbnailUrl,
  url: n.url,
  createdAt: n.createdAt,
});

const validateKiokuDtoList = (ds: NoteSelectModel[]): NoteKioku[] =>
  ds.map(validateKiokuDto);

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
const searchNote = (db: AnyD1Database, log: Logger) => () =>
  fromPromise(
    (async () => {
      log.info("💽 searchNote 開始");

      // クエリ作成
      const query = drizzle(db)
        .select()
        .from(noteTable)
        .orderBy(desc(noteTable.createdAt)); // createdAt でソート

      log.debug(`SQL: ${query.toSQL().sql}`);
      log.debug(`PARAMS: ${query.toSQL().params}`);

      // 実行
      const notes = await query.all();

      return notes;
    })(),
    dbErrorHandling,
  );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newNoteKiokuRepository = (
  db: AnyD1Database,
  log: Logger,
): NoteKiokuRepositoryPort => ({
  getAll: () =>
    okAsync({}).andThen(searchNote(db, log)).map(validateKiokuDtoList),
});
