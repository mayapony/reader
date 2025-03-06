import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { bookTable } from './book'

// 标注表
export const annotationTable = sqliteTable(
  'annotations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    bookId: integer('book_id').references(() => bookTable.id, {
      onDelete: 'cascade',
    }),
    type: text('type', {
      enum: ['highlight', 'mark', 'underline', 'note', 'translation'],
    }),
    data: text('data').$default(() => '{}'),
    cfiRange: text('cfi_range').notNull(),
    sectionIndex: integer('section_index'),
    cfiRangeText: text('cfi_range_text').notNull(),
    iconClass: text('icon_class'),
    styles: text('styles').$default(() => '{}'),
    noteText: text('note_text'),
    translationText: text('translation_text'),
    locationPage: integer('location_page'),
    createTime: integer('create_time', { mode: 'timestamp_ms' }).default(sql`(unixepoch())`),
  },
  (table) => [index('book_loc_idx').on(table.bookId, table.locationPage)],
)

export type SelectAnnotation = typeof annotationTable.$inferSelect
export type InsertAnnotation = typeof annotationTable.$inferInsert
