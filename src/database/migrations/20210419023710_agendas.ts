import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('agendas', (table: Knex.CreateTableBuilder) => {
    table.string('id').notNullable().primary();
    table.string('requested').notNullable();
    table.string('received').notNullable();
    table.string('service_id').notNullable();
    table.boolean('canceled').defaultTo(false);
    table.boolean('confirmed').defaultTo(false);
    table.string('who_canceled');
    table.text('reason_cancellation').nullable();
    table.timestamp('time', { useTz: true }).notNullable();
    table.timestamp('date', { useTz: true }).notNullable();
    table.boolean('finished').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.foreign('requested').references('id').inTable('accounts');
    table.foreign('received').references('id').inTable('companies');
    table.foreign('service_id').references('id').inTable('services');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('agendas');
}
