const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('qr_scans', function(table) {
    table.index(['member_id','event_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).alterTable('qr_scans', function(table) {
    table.dropIndex(['member_id','event_id']);
  });
};