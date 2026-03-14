require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

async function testConnection() {
  // Use development config
  console.log("Using 'development' configuration");
  const db = knex(knexConfig.development);
  try {
    console.log("Testing connection...");
    const result = await db.raw("SELECT 1+1 AS result");
    console.log("Connection successful! Result:", result.rows);
    
    // Check if table exists
    let tableExists = await db.schema.hasTable("mentor_requests");
    console.log("Initial check: Table 'mentor_requests' exists:", tableExists);
    
    // List migrations
    console.log("Running migrations...");
    try {
      const [batch, log] = await db.migrate.latest();
      console.log("Migrations run successfully! Batch:", batch, "Log:", log);
    } catch (migError) {
      console.error("Migration specific error:");
      console.error(migError);
      if (migError.stack) console.error(migError.stack);
    }
    
    // Check if table exists again
    tableExists = await db.schema.hasTable("mentor_requests");
    console.log("Final check: Table 'mentor_requests' exists:", tableExists);
    
  } catch (error) {
    console.error("General error occurred!");
    console.error(error);
    if (error.stack) console.error(error.stack);
  } finally {
    await db.destroy();
  }
}

testConnection();
