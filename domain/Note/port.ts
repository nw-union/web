import type { AppError } from "@nw-union/nw-utils";
import type { ResultAsync } from "neverthrow";
import type { NoteId } from "../vo";
import type { Note } from "./type";

export interface NoteRepositoryPort {
  upsert(n: Note | Note[]): ResultAsync<undefined, AppError>;
  read(id: NoteId): ResultAsync<Note, AppError>;
  delete(n: Note | Note[]): ResultAsync<undefined, AppError>;
}
