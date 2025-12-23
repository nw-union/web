import type { AppError } from "@nw-union/nw-utils";
import type { ResultAsync } from "neverthrow";
import type {
  Doc as DocDto,
  DocInfo,
  GetDocQuery,
  SearchDocQuery,
} from "../../type";
import type { DocId } from "../vo";
import type { Doc } from "./type";

// Doc Repository Port
export interface DocRepositoryPort {
  upsert(d: Doc | Doc[]): ResultAsync<undefined, AppError>;
  read(id: DocId): ResultAsync<Doc, AppError>;

  get(q: GetDocQuery): ResultAsync<DocDto, AppError>;
  search(q: SearchDocQuery): ResultAsync<DocInfo[], AppError>;
}
