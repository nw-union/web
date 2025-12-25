import type { Logger } from "@nw-union/nw-utils";
import { desc, type InferSelectModel } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { fromPromise, okAsync } from "neverthrow";
import type { YoutubeKiokuRepositoryPort } from "../../domain/Kioku/port";
import type { YoutubeKioku } from "../../domain/Kioku/type";
import { youtubeTable } from "./schema";
import { dbErrorHandling } from "./util";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type YoutubeSelectModel = InferSelectModel<typeof youtubeTable>;
// type YoutubeSelectModel = InferInsertModel<typeof youtubeTable>;

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
// なし

// ----------------------------------------------------------------------------
// Validator (DTO -> Domain Type / DTO -> DTO)
// ----------------------------------------------------------------------------
// YoutubeSelectModel を KiokuDto に変換
const validateKiokuDto = (y: YoutubeSelectModel): YoutubeKioku => ({
  type: "YoutubeKioku",

  id: y.id,
  title: y.title,
  channelName: y.channelName,
  isPublic: y.isPublic === 1,
  duration: y.duration,
  createdAt: y.createdAt,
});

const validateKiokuDtoList = (ds: YoutubeSelectModel[]): YoutubeKioku[] =>
  ds.map(validateKiokuDto);

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
const searchYoutube = (db: AnyD1Database, log: Logger) => () =>
  fromPromise(
    (async () => {
      log.info("💽 searchYoutube 開始");

      // クエリ作成
      const query = drizzle(db)
        .select()
        .from(youtubeTable)
        .orderBy(desc(youtubeTable.createdAt)); // createdAt でソート

      log.debug(`SQL: ${query.toSQL().sql}`);
      log.debug(`PARAMS: ${query.toSQL().params}`);

      // 実行
      const youtubes = await query.all();

      return youtubes;
    })(),
    dbErrorHandling,
  );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newYoutubeKiokuRepository = (
  db: AnyD1Database,
  log: Logger,
): YoutubeKiokuRepositoryPort => ({
  getAll: () =>
    okAsync({}).andThen(searchYoutube(db, log)).map(validateKiokuDtoList),
});
