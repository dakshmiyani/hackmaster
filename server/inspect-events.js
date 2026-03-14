require("dotenv").config();
const knex = require("knex");
const knexConfig = require("./knexfile");

async function checkEventsColumns() {
  const db = knex(knexConfig.development);
  try {
    const columns = await db("events").columnInfo();
    console.log(Object.keys(columns));
  } catch (error) {
    console.error(error);
  } finally {
    await db.destroy();
  }
}

checkEventsColumns();
