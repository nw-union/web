/*
  DO NOT RENAME THIS FILE FOR DRIZZLE-ORM TO WORK
*/
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// helper
const zEnum = <T extends z.ZodEnum>(src: string, schema: T) =>
  text(src, { enum: schema.options as [string, ...string[]] }).$type<
    z.infer<T>
  >();

// ----------------------------------------------------------------------------
// Doc Table
// ----------------------------------------------------------------------------
// status カラムの値
const docStatusDbEnum = z.enum(["public", "private", "draft"]);
export type DocStatusDbEnum = z.infer<typeof docStatusDbEnum>;

// Entry テーブルのスキーマ
export const docTable = sqliteTable(
  "doc",
  {
    id: text("doc_id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: zEnum("status", docStatusDbEnum).notNull(),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // インデックス設定
    index("idx_created_at").on(table.createdAt),
  ],
);
