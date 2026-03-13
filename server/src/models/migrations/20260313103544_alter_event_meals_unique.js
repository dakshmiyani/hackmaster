const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('event_meals', function(table) {
    table.unique(['event_id','meal_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('event_meals', function(table) {
    table.dropUnique(['event_id','meal_id']);
  });
};