const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('event_meals',function(table){
    table.increments('event_meal_id').primary();

    table.integer('event_id').references('events.event_id');
    table.integer('meal_id').references('meals.meal_id');

    table.timestamp('meal_time');

    addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('event_meals');
};