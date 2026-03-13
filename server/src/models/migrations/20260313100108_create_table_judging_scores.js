const { addDefaultColumns } = require('../utils/migrationUtilities');
const { PUBLIC_SCHEMA } = require("../libs/dbConstants");

exports.up = function (knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('judging_scores', function (table) {

        table.increments('judging_score_id').primary();
        table.integer('judge_id').references('users.user_id');
        table.integer('team_id').references('teams.team_id');
        table.integer('criteria_id').references('judging_criteria.judging_criteria_id');
        table.integer('total_score');
        addDefaultColumns(table, knex);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('judging_scores');
};
