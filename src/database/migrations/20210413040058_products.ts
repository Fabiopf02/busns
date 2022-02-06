import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('products', (table: Knex.CreateTableBuilder) => {
    table.string('id').primary().unique();
    table.string('barcode', 13);
    table.string('name', 250).notNullable();
    table.string('image_url');
    table.double('price').notNullable();
    table.string('company_id', 24).notNullable();
    table.timestamps(true, true);

    table.foreign('company_id').references('id').inTable('companies');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('products');
}

