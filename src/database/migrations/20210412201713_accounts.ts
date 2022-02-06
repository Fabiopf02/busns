import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('accounts', (table: Knex.TableBuilder) => {
    table.string('id', 24).primary();
    table.string('type').notNullable();
    table.string('name', 100).notNullable();
    table.string('phone', 11).notNullable().unique();
    table.string('password').notNullable();
    table.string('firebase_token');
    table.string('password_reset_token');
    table.dateTime('password_reset_expires');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('accounts');
}
