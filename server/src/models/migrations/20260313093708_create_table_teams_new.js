const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants"); 

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('teams',function(table){
      table.increments('team_id').primary();

      table.integer('organization_id').references('organizations.org_id');
      table.integer('event_id').references('events.event_id');

      table.string('name',255).notNullable();
      table.string('project_link',800);

      addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('teams');
};