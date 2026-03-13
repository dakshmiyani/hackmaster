const { addDefaultColumns } = require('../utils/migrationUtilities');       
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('meals',function(table){
    table.increments('meal_id').primary();

    table.integer('org_id').references('organizations.org_id');

    table.string('name',255);
    table.string('meal_type');

    addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('meals');
};