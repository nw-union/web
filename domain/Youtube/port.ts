import type { AppError } from "@nw-union/nw-utils";
import type { ResultAsync } from "neverthrow";
import type { YoutubeId } from "../vo";
import type { Youtube } from "./type";

export interface YoutubeRepositoryPort {
  upsert(y: Youtube | Youtube[]): ResultAsync<undefined, AppError>;
  read(id: YoutubeId): ResultAsync<Youtube, AppError>;
  delete(y: Youtube | Youtube[]): ResultAsync<undefined, AppError>;
}
