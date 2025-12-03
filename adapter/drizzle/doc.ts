import { match } from "ts-pattern";
import {
  type InferSelectModel,
  type InferInsertModel,
  asc,
  eq,
  inArray,
  desc,
} from "drizzle-orm";
import { docTable, type DocStatusDbEnum } from "./schema";
import type {
  Doc,
  DocInfo,
  DocRepositoryPort,
  SearchDocQuery,
} from "../../type";
import { fromPromise, ok, okAsync, Result, type ResultAsync } from "neverthrow";
import { dbErrorHandling } from "./util";
import { drizzle, type AnyD1Database } from "drizzle-orm/d1";
import { type AppError, NotFoundError, type Logger } from "@nw-union/nw-utils";
import { toShortUuid } from "@nw-union/nw-utils/lib/uuid";

// ----------------------------------------------------------------------------
// DTO
// ----------------------------------------------------------------------------
type DocSelectModel = InferSelectModel<typeof docTable>;
type DocInsertModel = InferInsertModel<typeof docTable>;

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
/**
 * Doc を DocInsertModel に変換
 *
 * @param doc - Doc (Domain)
 * @return DocInsertModel (DTO)
 *
 */
const convToDocInsertModel = (doc: Doc): DocInsertModel => ({
  id: doc.id,
  title: doc.title,
  description: doc.description,
  status: match(doc.status)
    .with("draft", (): DocStatusDbEnum => "draft")
    .with("private", (): DocStatusDbEnum => "private")
    .with("public", (): DocStatusDbEnum => "public")
    .exhaustive(),
  body: doc.body,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const convToDocInsertModelList = (doc: Doc | Doc[]): DocInsertModel[] =>
  Array.isArray(doc)
    ? doc.map((d) => convToDocInsertModel(d))
    : [convToDocInsertModel(doc)];

// ----------------------------------------------------------------------------
// Validater (DTO -> Domain Type / DTO -> DTO)
// ----------------------------------------------------------------------------
/**
 * ElementSelectModel を Element (Domain) に変換
 *
 * @param d - ElementSelectModel
 * @return Result<Element, AppError> - Element (Domain) or AppError
 *
 */
const validateDoc = (d: DocSelectModel): Result<Doc, AppError> =>
  ok({
    type: "Doc",
    id: d.id,
    title: d.title,
    description: d.description,
    status: match(d.status)
      .with("draft", (): "draft" => "draft")
      .with("private", (): "private" => "private")
      .with("public", (): "public" => "public")
      .exhaustive(),
    body: d.body,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  });

const validateDocInfo = (d: DocSelectModel): Result<DocInfo, AppError> =>
  ok({
    id: d.id,
    slug: toShortUuid(d.id).unwrapOr(d.id), // 変換に失敗したら id をそのまま使う
    title: d.title,
    description: d.description,
    status: match(d.status)
      .with("draft", (): "draft" => "draft")
      .with("private", (): "private" => "private")
      .with("public", (): "public" => "public")
      .exhaustive(),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  });
const validateDocInfoList = (
  ds: DocSelectModel[],
): Result<DocInfo[], AppError> => Result.combine(ds.map(validateDocInfo));

// ----------------------------------------------------------------------------
// Adapter Logic [外部接続]
// ----------------------------------------------------------------------------
// upsertDocInsertModel を DB に保存する
const upsertDocInsertModel =
  (db: AnyD1Database, log: Logger) =>
  (docs: DocInsertModel[]): ResultAsync<undefined, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 upsertDocInsertModel 開始");

        // 既存のデータを削除するクエリ発行
        const delQuery = drizzle(db)
          .delete(docTable)
          .where(
            inArray(
              docTable.id,
              docs.map((d) => d.id),
            ),
          );
        log.debug(`SQL: ${delQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${delQuery.toSQL().params}`);

        // データを挿入するクエリ発行
        const insertQuery = drizzle(db).insert(docTable).values(docs);
        log.debug(`SQL: ${insertQuery.toSQL().sql}`);
        log.debug(`PARAMS: ${insertQuery.toSQL().params}`);

        // クエリ実行 (batch を使い, 1トランザクションで実行)
        await drizzle(db).batch([delQuery, insertQuery]);

        return undefined;
      })(),
      dbErrorHandling,
    );

// ID でコンテンツを取得する
const readDoc =
  (db: AnyD1Database, log: Logger) =>
  (id: string): ResultAsync<DocSelectModel, AppError> =>
    fromPromise(
      (async () => {
        log.info("💽 readContent 開始");

        // クエリ発行
        const query = drizzle(db)
          .select()
          .from(docTable)
          .where(eq(docTable.id, id))
          .orderBy(asc(docTable.createdAt)); // orderNum でソート
        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // クエリ実行
        const docs = await query.all();

        // content が null / undefind の場合は、NotFound とする
        if (!docs || docs.length === 0) {
          throw new NotFoundError(`doc not found. id=${id}`);
        }

        return docs[0]; // ID で検索しているので、1件しか返ってこない
      })(),
      dbErrorHandling,
    );

const searchContents =
  (db: AnyD1Database, log: Logger) => (q: SearchDocQuery) =>
    fromPromise(
      (async () => {
        log.info("💽 searchContents 開始");

        // クエリ作成
        const query = drizzle(db)
          .select()
          .from(docTable)
          .orderBy(desc(docTable.createdAt)); // createdAt でソート

        // クエリに条件を追加
        if (q.statuses) {
          query.where(inArray(docTable.status, q.statuses));
        }

        log.debug(`SQL: ${query.toSQL().sql}`);
        log.debug(`PARAMS: ${query.toSQL().params}`);

        // 実行
        const docs = await query.all();

        return docs;
      })(),
      dbErrorHandling,
    );

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newDocRepository = (
  db: AnyD1Database,
  log: Logger,
): DocRepositoryPort => ({
  upsertDoc: (doc) =>
    okAsync(doc)
      .map(convToDocInsertModelList)
      .andThen(upsertDocInsertModel(db, log)),

  readDoc: (id) =>
    okAsync(id.toString()).andThen(readDoc(db, log)).andThen(validateDoc),

  searchDoc: (q) =>
    okAsync(q).andThen(searchContents(db, log)).andThen(validateDocInfoList),
});
