import { type AppError, type Logger, SystemError } from "@nw-union/nw-utils";
import { uuidv4 } from "@nw-union/nw-utils/lib/uuid";
import {
  err,
  fromPromise,
  ok,
  okAsync,
  type Result,
  type ResultAsync,
} from "neverthrow";
import { match } from "ts-pattern";
import type { StoragePort } from "../../domain/System/workflow";
import { dbErrorHandling } from "../drizzle/util"; // FIXME

// ----------------------------------------------------------------------------
// Adapter Logic
// ----------------------------------------------------------------------------
const uploadFile =
  (bucket: R2Bucket, log: Logger, data: Blob) =>
  (path: string): ResultAsync<void, AppError> =>
    fromPromise(
      (async () => {
        log.info("🪣 uploadFile 開始");
        log.debug(`path: ${path}`);

        await bucket.put(path, await data.arrayBuffer(), {
          httpMetadata: {
            contentType: data.type,
          },
        });

        return;
      })(),
      dbErrorHandling, // FIXME
    );

// ファイルからファイルパスを作成します
const getFilePath = (file: Blob): Result<string, AppError> =>
  match(file.type)
    .with("image/png", () => ok(`image/${uuidv4()}.png`))
    .with("image/jpeg", () => ok(`image/${uuidv4()}.jpg`))
    .with("image/jpg", () => ok(`image/${uuidv4()}.jpg`))
    .with("audio/mpeg", () => ok(`audio/${uuidv4()}.mp3`))
    .with("audio/x-m4a", () => ok(`audio/${uuidv4()}.m4a`))
    .with("video/mp4", () => ok(`video/${uuidv4()}.mp4`))
    // .... FIXME: 必要に応じて追加
    .otherwise(() =>
      // FIXME
      err(
        new SystemError(
          `サポートされていないファイル形式です: ${file.type || "不明"}`,
        ),
      ),
    );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newStorage = (
  bucket: R2Bucket,
  domain: string,
  log: Logger,
): StoragePort => ({
  putObject: (data: Blob) =>
    okAsync(data)
      .andThen(getFilePath)
      .andThrough(uploadFile(bucket, log, data))
      .map((path) => `${domain}/${path}`),
});
