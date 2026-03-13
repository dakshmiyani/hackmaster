const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('team_members', function(table) {
    table.boolean('is_leader').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('team_members', function(table) {
    table.dropColumn('is_leader');
  });
};