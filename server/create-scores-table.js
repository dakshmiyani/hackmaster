require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

async function createTeamScoresTable() {
  const db = knex(knexConfig.development);
  try {
    const hasTable = await db.schema.hasTable("team_scores");
    if (!hasTable) {
      await db.schema.createTable("team_scores", (table) => {
        table.increments("id").primary();
        table.integer("team_id").unsigned().notNullable().references("team_id").inTable("teams").onDelete("CASCADE");
        table.integer("judge_id").unsigned(); // Optional link to user table
        table.string("domain").notNullable();
        table.integer("total_score").notNullable();
        table.jsonb("breakdown");
        table.timestamps(true, true);
      });
      console.log("Table 'team_scores' created successfully.");
    } else {
      console.log("Table 'team_scores' already exists.");
    }
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await db.destroy();
  }
}

createTeamScoresTable();
