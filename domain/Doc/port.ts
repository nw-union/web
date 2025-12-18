import type { AppError } from "@nw-union/nw-utils";
import type { ResultAsync } from "neverthrow";
import type { DocInfo, SearchDocQuery } from "../../type";
import type { Doc } from "./type";

// Doc Repository Port
export interface DocRepositoryPort {
  upsertDoc(d: Doc | Doc[]): ResultAsync<undefined, AppError>;
  readDoc(id: string): ResultAsync<Doc, AppError>;
  searchDoc(q: SearchDocQuery): ResultAsync<DocInfo[], AppError>;
}
