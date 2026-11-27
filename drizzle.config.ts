import { defineConfig } from 'drizzle-kit';

// Usado para `npm run db:push` (sync schema directo, útil en dev)
// y `npm run db:generate` (genera archivos de migración SQL)
export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
