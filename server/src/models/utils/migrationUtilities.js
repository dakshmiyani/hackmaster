const { TABLE_DEFAULTS } = require("../libs/dbConstants");


const addDefaultColumns = (table, knex) => {
    table.integer(TABLE_DEFAULTS.COLUMNS.CREATED_BY.KEY);
    table.integer(TABLE_DEFAULTS.COLUMNS.LAST_MODIFIED_BY.KEY);
    table.boolean(TABLE_DEFAULTS.COLUMNS.IS_DELETED.KEY).defaultTo(false);
    table.boolean(TABLE_DEFAULTS.COLUMNS.IS_ACTIVE.KEY).defaultTo(true);

    table.timestamp(TABLE_DEFAULTS.COLUMNS.CREATED_AT.KEY).defaultTo(knex ? knex.fn.now() : 'CURRENT_TIMESTAMP');
    table.timestamp(TABLE_DEFAULTS.COLUMNS.UPDATED_AT.KEY).defaultTo(knex ? knex.fn.now() : 'CURRENT_TIMESTAMP');
};

module.exports = {
    addDefaultColumns
};
