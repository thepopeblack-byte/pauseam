import {index, integer, sqliteTable} from 'drizzle-orm/sqlite-core';
// Licence reservations only: no user identifiers, text, audio or research records.
export const modelUsage=sqliteTable('pauseam_model_usage',{
 id:integer('id').primaryKey({autoIncrement:true}),
 reservedAt:integer('reserved_at').notNull(),
},table=>[index('idx_pauseam_model_usage_reserved_at').on(table.reservedAt)]);
