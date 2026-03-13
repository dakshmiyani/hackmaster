const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('qr_scans',function(table){
    table.increments('qr_scan_id').primary();

    table.integer('org_id').references('organizations.org_id');
    table.integer('event_id').references('events.event_id');
    table.integer('member_id').references('members.member_id');

    table.string('scan_type'); 
    // checkin | checkout | meal

    table.timestamp('scan_time');

    addDefaultColumns(table,knex);
  })
};

exports.down = function(knex) {
  return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('qr_scans');
};