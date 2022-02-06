import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('companies', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.string('account_id', 24).notNullable().unique();
    table.string('description', 700).nullable();
    table.string('segment').notNullable();
    table.string('website').nullable();
    table.string('email').nullable();
    table.specificType('phones', 'text ARRAY').nullable();
    table.specificType('images', 'text ARRAY').nullable();
    table.boolean('activated').defaultTo(false);
    table.dateTime('opening');
    table.dateTime('closing');

    table.foreign('account_id').references('id').inTable('accounts');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('companies');
}
