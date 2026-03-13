const { addDefaultColumns } = require('../utils/migrationUtilities');
const {PUBLIC_SCHEMA} = require("../libs/dbConstants");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).createTable('roles', function(table) {
        table.increments('role_id').primary();
        table.string('name', 255).notNullable().unique();

        addDefaultColumns(table, knex);
    });
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.withSchema(PUBLIC_SCHEMA).dropTable('roles');
  
};
