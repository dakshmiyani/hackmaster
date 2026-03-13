const { addDefaultColumns } = require('../utils');
const PUBLIC_SCHEMA = require("../libs/dbConstants")|| 'public';

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('organizations', function(table){
    table.increments('id').primary();
    table.string('name',255).notNullable();
    table.string('email',255);
    table.string('website',255);
    table.string('logo_url',500);

    addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('organizations');
};
