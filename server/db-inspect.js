const knex = require('knex')(require('./knexfile').development);

async function inspect() {
  try {
    const requests = await knex('mentor_requests')
      .select('id', 'team_id', 'created_by', 'is_served')
      .orderBy('id', 'desc')
      .limit(10);
    
    console.log('--- DATA START ---');
    requests.forEach(r => {
      console.log(`REQ_ID=${r.id} TEAM_ID=${r.team_id} SERVED=${r.is_served}`);
    });
    console.log('--- DATA END ---');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
