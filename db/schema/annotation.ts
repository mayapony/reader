import { sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { books } from './book'

// 标注表
export const annotations = sqliteTable(
  'annotations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id').references(() => books.id, {
      onDelete: 'cascade',
    }),
    type: text('type', {
      enum: ['highlight', 'mark', 'underline', 'note', 'translation'],
    }),
    selectedText: text('selected_text').notNull(),
    noteText: text('note_text'),
    translationText: text('translation_text'),
    cfiRange: text('cfi_range').notNull(),
    locationPage: integer('location_page'),
    createTime: integer('create_time', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`),
  },
  (table) => [index('book_loc_idx').on(table.bookId, table.locationPage)],
)
