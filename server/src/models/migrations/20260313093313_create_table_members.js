const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('members',function(table){
      table.increments('member_id').primary();

      table.integer('org_id').references('organizations.org_id');
      table.integer('event_id').references('events.event_id');

      table.string('name',255);
      table.string('email',255);
      table.string('college',255);

      addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('members');
};