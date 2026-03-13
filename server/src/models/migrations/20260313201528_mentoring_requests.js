const {PUBLIC_SCHEMA} = require("../libs/dbConstants");
const { addDefaultColumns } = require('../utils/migrationUtilities');

exports.up = function(knex) {
  return knex.schema.createTable(`${PUBLIC_SCHEMA}.mentoring_requests`, function(table) {

    table.increments('id').primary();

    table
      .integer('team_id')
      .unsigned()
      .notNullable()
      .references('team_id')
      .inTable('teams')
      .onDelete('CASCADE');

    table
      .boolean('is_served')
      .defaultTo(false);

    

    addDefaultColumns(table, knex);

  });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists(`${PUBLIC_SCHEMA}.mentoring_requests`);
};