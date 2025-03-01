// src/lib/db/schema.ts
import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core'

// 日粒度统计表
export const dailyStats = sqliteTable(
  'daily_stats',
  {
    date: text('date').primaryKey(), // YYYY-MM-DD
    totalDuration: integer('total_duration').default(0),
    sessionCount: integer('session_count').default(0),
  },
  (table) => [index('daily_date_idx').on(table.date)],
)

// 月粒度缓存表
export const monthlyStats = sqliteTable(
  'monthly_stats',
  {
    month: text('month').primaryKey(), // YYYY-MM
    totalDuration: integer('total_duration').default(0),
    activeDays: integer('active_days').default(0),
  },
  (table) => [index('monthly_idx').on(table.month)],
)

// 类型定义
export type DailyStat = typeof dailyStats.$inferSelect
export type MonthlyStat = typeof monthlyStats.$inferSelect
