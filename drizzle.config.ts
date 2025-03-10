import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo', // <--- very important
} satisfies Config
