import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { books } from './book'

// 阅读记录表
export const readingSessions = sqliteTable(
  'reading_sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id').references(() => books.id, {
      onDelete: 'cascade',
    }),
    startTime: integer('start_time', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`),
    endTime: integer('end_time', { mode: 'timestamp_ms' }),
    duration: integer('duration'), // 单位：秒
  },
  (table) => [
    index('book_idx').on(table.bookId),
    index('time_range_idx').on(table.startTime, table.endTime),
  ],
)
