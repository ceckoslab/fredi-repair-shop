import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable('bookings', {
  ticket: text('ticket').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  name: text('name').notNull(), email: text('email').notNull(),
  phone: text('phone').notNull(), postcode: text('postcode').notNull().default(''), device: text('device').notNull(),
  brand: text('brand').notNull(), model: text('model').notNull(),
  service: text('service').notNull(), issue: text('issue').notNull(),
  date: text('date').notNull(), time: text('time').notNull(),
  language: text('language').notNull(), status: text('status').notNull(),
  note: text('note').notNull(), createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, t => [index('bookings_created').on(t.createdAt)]);
export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull(),
});
