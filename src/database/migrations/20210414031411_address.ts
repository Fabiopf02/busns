import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('address', (table: Knex.CreateTableBuilder) => {
    table.increments('id').primary();
    table.string('street').notNullable();
    table.string('neighborhood').notNullable();
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('number').notNullable();
    table.string('zip_code').notNullable();
    table.specificType('coords', 'float ARRAY').notNullable();
    table.string('account_id').notNullable();

    table.foreign('account_id').references('id').inTable('accounts');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('address');
}

