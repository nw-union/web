import type { AppError } from "@nw-union/nw-utils";
import type { ResultAsync } from "neverthrow";
import type { SearchVideoQuery, Video as VideoDto } from "../../type";

// Video Repository Port
export interface VideoRepositoryPort {
  search(q: SearchVideoQuery): ResultAsync<VideoDto[], AppError>;
}
