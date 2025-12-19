import type { AppError } from "@nw-union/nw-utils";
import { newType } from "@nw-union/nw-utils/lib/zod";
import type { ResultAsync } from "neverthrow";
import z from "zod";

export type Doc = {
  type: "Doc";
  id: string;
  title: string;
  description: string;
  status: DocStatus;
  body: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocInfo = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: DocStatus;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SearchDocQuery = {
  statuses?: DocStatus[];
};

const docStatus = z.enum([
  "public", // 公開
  "private", // メンバー限定
  "draft", // 下書き
]);
export type DocStatus = z.infer<typeof docStatus>;
export const allDocStatus = docStatus.options;
export const newDocStatus = newType(docStatus, "DocStatus");

// ---------------------------

export type Video = {
  type: "Video";

  id: string;
  title: string;
  channelName: string;
  duration: string;
  uploadedAt: string;
  isPublic: boolean;
};

// ---------------------------

// Doc Repository Port
export interface DocRepositoryPort {
  upsertDoc(d: Doc | Doc[]): ResultAsync<undefined, AppError>;
  readDoc(id: string): ResultAsync<Doc, AppError>;
  searchDoc(q: SearchDocQuery): ResultAsync<DocInfo[], AppError>;
}

// Video Repository Port
export interface VideoRepositoryPort {
  searchVideo(): ResultAsync<Video[], AppError>;
}
