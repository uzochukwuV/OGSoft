import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * Database connection configuration
 * 
 * This file sets up the connection to PostgreSQL using Drizzle ORM
 * and exports the database client for use throughout the application.
 */

// Create a PostgreSQL connection pool
// In production, these values should come from environment variables
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '787898',
  database: process.env.POSTGRES_DB || 'ogsoft',
  ssl: false,  
});

// Create a Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });

// Export schema for use in other files
export { schema };