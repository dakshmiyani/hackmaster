const path = require("path");
const fs = require("fs");
require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

async function manualTableCreate() {
  const db = knex(knexConfig.development);
  try {
    console.log("Attempting manual table creation...");
    
    const tableExists = await db.schema.hasTable("mentor_requests");
    if (tableExists) {
        console.log("Table 'mentor_requests' already exists. Dropping it to ensure clean state...");
        await db.schema.dropTable("mentor_requests");
    }
    
    console.log("Creating table 'mentor_requests'...");
    await db.schema.createTable('mentor_requests', (table) => {
        table.increments('id').primary();
        table.integer('team_id').notNullable();
        table.integer('created_by').notNullable();
        table.boolean('is_served').defaultTo(false);
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_deleted').defaultTo(false);
        table.integer('last_modified_by').nullable();
        table.timestamps(true, true);
    });
    
    console.log("Table 'mentor_requests' created successfully!");
    
    // Also ensure knex_migrations has the entry so it doesn't try to run it again
    const hasMigTable = await db.schema.hasTable("knex_migrations");
    if (hasMigTable) {
        const migName = '20260313125835_create_mentor_requests.js';
        const existing = await db("knex_migrations").where({ name: migName }).first();
        if (!existing) {
            console.log("Adding record to knex_migrations...");
            await db("knex_migrations").insert({
                name: migName,
                batch: 1,
                migration_time: new Date()
            });
        }
    }
    
    console.log("Done!");
    
  } catch (error) {
    console.error("Manual creation failed!");
    console.error(error);
  } finally {
    await db.destroy();
  }
}

manualTableCreate();
