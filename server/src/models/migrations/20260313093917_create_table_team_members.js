const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('team_members',function(table){
      table.increments('team_member_id').primary();

      table.integer('team_id').references('teams.team_id');
      table.integer('member_id').references('members.member_id');

      addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('team_members');
};