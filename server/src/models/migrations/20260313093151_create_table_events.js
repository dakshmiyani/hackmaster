const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");


exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('events',function(table){
      table.increments('event_id').primary();
      table.integer('org_id').references('organizations.org_id');

      table.string('name',255).notNullable();
      table.text('description');
      table.string('location',255);

      table.timestamp('start_date');
      table.timestamp('end_date');

      addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('events');
}   
