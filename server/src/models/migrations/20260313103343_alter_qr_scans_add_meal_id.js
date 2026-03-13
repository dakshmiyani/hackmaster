
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('qr_scans', function(table) {

    table.integer('meal_id')
      .references('meal_id')
      .inTable('meals')
      .nullable();

  });
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('qr_scans', function(table) {
    table.dropColumn('meal_id');
  });
};