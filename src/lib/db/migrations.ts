import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '.';

/**
 * Database migrations
 * 
 * This file provides utilities for running database migrations
 * to create and update the database schema.
 */

// Function to run migrations
export async function runMigrations() {
  console.log('Running migrations...');
  
  try {
    // This will automatically run needed migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// If this file is run directly, execute migrations
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}