import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 书籍表
export const books = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    author: text("author"),
    coverPath: text("cover_path"),
    filePath: text("file_path").notNull().unique(),
    fileHash: text("file_hash").notNull(),
    totalPages: integer("total_pages"),
    currentProgress: real("current_progress").default(0),
    lastReadTime: integer("last_read_time", { mode: "timestamp" }),
    lastReadCfiRange: text("last_read_cfi_range"),
    isFinished: integer("is_finished", { mode: "boolean" }).default(false),
    importTime: integer("import_time", { mode: "timestamp" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    index("progress_idx").on(table.currentProgress),
    uniqueIndex("file_path_idx").on(table.filePath),
  ]
);
