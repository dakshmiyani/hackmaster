const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");

exports.up = function (knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('judging_criteria', function (table) {
        table.increments('judging_criteria_id').primary();
        table.integer('event_id').references('events.event_id');
        table.string('criteria_name', 255);
        table.integer('criteria_max_score');
        addDefaultColumns(table, knex);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('judging_criteria');

};
