import type { AppError } from "@nw-union/nw-utils";
import { newType } from "@nw-union/nw-utils/lib/zod";
import type { ResultAsync } from "neverthrow";
import z from "zod";

// ---------------------------

export type Doc = {
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

const docStatus = z.enum([
  "public", // 公開
  "private", // メンバー限定
]);
export type DocStatus = z.infer<typeof docStatus>;
export const allDocStatus = docStatus.options;
export const newDocStatus = newType(docStatus, "DocStatus");

// ---------------------------

export interface DocWorkFlows {
  // ドキュメント作成
  create(cmd: CreateDocCmd): ResultAsync<CreateDocEvt, AppError>;
  // ドキュメントを編集する
  update(cmd: UpdateDocCmd): ResultAsync<UpdateDocEvt, AppError>;

  // ドキュメントを見る
  get(q: GetDocQuery): ResultAsync<GetDocEvt, AppError>;
  // ドキュメントを探す
  search(q: SearchDocQuery): ResultAsync<SearchDocEvt, AppError>;
}

// CreateDoc コマンド
export type CreateDocCmd = {
  title: string;
  userId: string; // 作成者ID
};

// CreateDoc イベント
export type CreateDocEvt = {
  id: string;
};

// UpdateDoc コマンド
export type UpdateDocCmd = {
  id: string; // 編集するドキュメントのID
  title: string;
  description: string;
  status: DocStatus;
  body: string;
  thumbnailUrl: string;
  userId: string; // 編集者ID
};

// UpdateDoc イベント
export type UpdateDocEvt = undefined;

// GetDoc クエリ
export type GetDocQuery = {
  id: string;
};

// GetDoc イベント
export type GetDocEvt = {
  doc: Doc;
};

// SearchDoc クエリ
export type SearchDocQuery = {
  statuses?: DocStatus[];
};

// SearchDoc イベント
export type SearchDocEvt = {
  docs: DocInfo[];
};

// ---------------------------

export type Video = {
  id: string;
  title: string;
  channelName: string;
  duration: string;
  uploadedAt: string;
  isPublic: boolean;
};

export interface VideoWorkFlows {
  // エントリを探す
  search(q: SearchVideoQuery): ResultAsync<SearchVideoEvt, AppError>;
}

// SearchVideo クエリ
export type SearchVideoQuery = Record<string, never>;

// SearchVideo イベント
export type SearchVideoEvt = {
  videos: Video[];
};

// ---------------------------

export interface SystemWorkFlows {
  // ファイルをアップロードする
  uploadFile(cmd: UploadFileCmd): ResultAsync<UploadFileEvt, AppError>;
}

// UploadFile コマンド
export interface UploadFileCmd {
  file: Blob;
}

// UploadFile イベント
export interface UploadFileEvt {
  url: string;
}

// ---------------------------

export type User = {
  id: string;
  name: string;
  email: string;
  imgUrl: string;
};

export interface UserWorkFlows {
  // ユーザーを取得する
  get(q: GetUserQuery): ResultAsync<GetUserEvt, AppError>;
}

// GetUser クエリ
export interface GetUserQuery {
  id: string;
  email: string;
}

// GetUser イベント
export interface GetUserEvt {
  user: User;
}
