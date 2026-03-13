/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('mentor_requests', (table) => {
    table.increments('id').primary();
    table.integer('team_id').notNullable();
    table.string('team_name').notNullable();
    table.string('leader_name').notNullable();
    table.string('leader_email').notNullable();
    table.string('problem_statement').notNullable();
    table.string('category').notNullable(); // AI/ML, Web Dev etc
    table.integer('mentor_id').nullable();
    table.string('mentor_name').nullable();
    table.string('room_id').nullable();
    table.enum('status', ['pending', 'accepted', 'completed'])
         .defaultTo('pending');
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
