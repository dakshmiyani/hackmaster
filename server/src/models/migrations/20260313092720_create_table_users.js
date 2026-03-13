const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");


exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('users',function(table){
      table.increments('user_id').primary();
      table.integer('org_id').references('organizations.org_id');

      table.string('name',255).notNullable();
      table.string('email',255).notNullable().unique();
      table.string('password',255).notNullable();
      table.integer('role_id').references('roles.role_id');

      addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('users');
};