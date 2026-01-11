import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { AppError, type Logger, SystemError } from "@nw-union/nw-utils";
import { uuidv4 } from "@nw-union/nw-utils/lib/uuid";
import {
  err,
  fromPromise,
  ok,
  okAsync,
  type Result,
  type ResultAsync,
} from "neverthrow";
import { match, P } from "ts-pattern";
import type { StoragePort } from "../../domain/System/workflow";

// ----------------------------------------------------------------------------
// Error Handling
// ----------------------------------------------------------------------------
const fsErrorHandling = (e: unknown): AppError =>
  match(e)
    .with(P.instanceOf(AppError), (e) => e)
    .with(P.instanceOf(Error), (e) => new SystemError(e.message, [], e))
    .otherwise((e) => new SystemError(`filesystem unknown error. error: ${e}`));

// ----------------------------------------------------------------------------
// Adapter Logic
// ----------------------------------------------------------------------------
const writeLocalFile =
  (basePath: string, log: Logger, data: Blob) =>
  (path: string): ResultAsync<void, AppError> =>
    fromPromise(
      (async () => {
        log.info("💾 writeLocalFile 開始");
        log.debug(`path: ${path}`);

        const fullPath = join(basePath, path);
        const dirPath = dirname(fullPath);

        // ディレクトリを再帰的に作成
        await mkdir(dirPath, { recursive: true });

        // Blob を Buffer に変換して書き込み
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(fullPath, buffer);

        log.debug(`file written: ${fullPath}`);
      })(),
      fsErrorHandling,
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
export const newLocalStorage = (
  basePath: string,
  log: Logger,
): StoragePort => ({
  putObject: (data: Blob) =>
    okAsync(data)
      .andThen(getFilePath)
      .andThrough(writeLocalFile(basePath, log, data))
      .map((path) => `http://localhost:5173/localstorage/${path}`),
});
