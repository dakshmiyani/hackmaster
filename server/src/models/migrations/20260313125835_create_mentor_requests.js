/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('mentor_requests', (table) => {
    table.increments('id').primary();
    table.integer('team_id').notNullable();
    table.integer('created_by').notNullable();
    table.boolean('is_served').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_deleted').defaultTo(false);
    table.integer('last_modified_by').nullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('mentor_requests');
};
