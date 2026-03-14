require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

async function inspectMigrations() {
  const db = knex(knexConfig.development);
  try {
    console.log("Inspecting migrations...");
    const migrations = await db("knex_migrations").select("*");
    console.log("Migrations in DB:", migrations);
    
    const tableExists = await db.schema.hasTable("mentor_requests");
    console.log("Table 'mentor_requests' exists:", tableExists);
    
  } catch (error) {
    console.error("Error occurred!");
    console.error(error);
  } finally {
    await db.destroy();
  }
}

inspectMigrations();
