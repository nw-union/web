import type { AppError, Logger } from "@nw-union/nw-utils";
import { desc, type InferSelectModel } from "drizzle-orm";
import { type AnyD1Database, drizzle } from "drizzle-orm/d1";
import { fromPromise, ok, Result } from "neverthrow";
import type { VideoRepositoryPort } from "../../domain/Video/port";
import type { Video as VideoDto } from "../../type";
import { videoTable } from "./schema";
import { dbErrorHandling } from "./util";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type VideoSelectModel = InferSelectModel<typeof videoTable>;
// type VideoInsertModel = InferInsertModel<typeof videoTable>;

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
const validateVideoInfo = (d: VideoSelectModel): Result<VideoDto, AppError> =>
  ok({
    id: d.id,
    title: d.title,
    channelName: d.channelName,
    duration: d.duration,
    uploadedAt: d.uploadedAt,
    isPublic: d.isPublic === 1, // FIXME
  });
const validateVideoList = (
  ds: VideoSelectModel[],
): Result<VideoDto[], AppError> => Result.combine(ds.map(validateVideoInfo));

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
const searchVideos = (db: AnyD1Database, log: Logger) => () =>
  fromPromise(
    (async () => {
      log.info("💽 searchVideos 開始");

      // クエリ作成
      const query = drizzle(db)
        .select()
        .from(videoTable)
        .orderBy(desc(videoTable.createdAt)); // createdAt でソート

      // クエリに条件を追加
      //if (q.statuses) {
      //  query.where(inArray(docTable.status, q.statuses));
      //}

      log.debug(`SQL: ${query.toSQL().sql}`);
      log.debug(`PARAMS: ${query.toSQL().params}`);

      // 実行
      const videos = await query.all();

      return videos;
    })(),
    dbErrorHandling,
  );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newVideoRepository = (
  db: AnyD1Database,
  log: Logger,
): VideoRepositoryPort => ({
  search: () => searchVideos(db, log)().andThen(validateVideoList),
});
