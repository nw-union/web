import type { AppError } from "@nw-union/nw-utils";
import { newType } from "@nw-union/nw-utils/lib/zod";
import type { ResultAsync } from "neverthrow";
import z from "zod";

export type Doc = {
  id: string;
  title: string;
  description: string;
  status: DocStatus;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocInfo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: DocStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SearchDocQuery = {
  statuses?: DocStatus[];
};

const docStatus = z.enum([
  "public", // 公開
  "private", // メンバー限定
]);
export type DocStatus = z.infer<typeof docStatus>;
export const allDocStatus = docStatus.options;
export const newDocStatus = newType(docStatus, "DocStatus");

// ---------------------------

// Doc Repository Port
export interface DocRepositoryPort {
  upsertDoc(d: Doc | Doc[]): ResultAsync<undefined, AppError>;
  readDoc(id: string): ResultAsync<Doc, AppError>;
  searchDoc(q: SearchDocQuery): ResultAsync<DocInfo[], AppError>;
}
