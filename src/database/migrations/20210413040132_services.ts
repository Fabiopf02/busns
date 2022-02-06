import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('services', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.double('price').notNullable();
    table.boolean('delivery').notNullable();
    table.boolean('schedulable').notNullable();
    table.boolean('associated_product').defaultTo(false);
    table.boolean('activated').defaultTo(false);
    table.string('company_id').notNullable();
    table.timestamps(true, true);

    table.foreign('company_id').references('id').inTable('companies');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('services');
}

