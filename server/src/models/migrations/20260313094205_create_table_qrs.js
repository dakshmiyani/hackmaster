const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('qrs',function(table){
    table.increments('qr_id').primary();

   
    table.integer('member_id').references('members.member_id');

    table.string('qr_code',500).unique();
    table.string('qr_url',500).unique();

    addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('qrs');
};