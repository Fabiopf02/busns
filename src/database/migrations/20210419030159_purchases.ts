import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('purchases', (table: Knex.CreateTableBuilder) => {
    table.increments('id').primary();
    table.string('product_id').notNullable();
    table.string('buyer_id').notNullable();
    table.string('seller_id').notNullable();
    table.double('price').notNullable();
    table.integer('the_amount').notNullable();
    table.string('schedule_id').notNullable();
    table.timestamps(true, true);

    table.foreign('product_id').references('id').inTable('products');
    table.foreign('seller_id').references('id').inTable('companies');
    table.foreign('buyer_id').references('id').inTable('accounts');
    table.foreign('schedule_id').references('id').inTable('agendas');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('purchases');
}
