import type { Config } from 'drizzle-kit';

/**
 * Drizzle ORM configuration file
 * 
 * This file configures the drizzle-kit tools for schema migrations
 */
export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5433,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '787898',
    database: process.env.POSTGRES_DB || 'ogsoft',
     ssl: false,  
  },
} satisfies Config;