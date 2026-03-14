const BaseModel = require('./libs/BaseModel');

class MentorRequestModel  extends BaseModel {
constructor() {
    super();
    this.table = "mentor_requests";
  }

  async createRequest({ team_id, created_by }) {
    const db = await this.getQueryBuilder();

    const [request] = await db(this.table)
      .insert({
        team_id,
        created_by,
        is_served: false,
        is_active: true,
        is_deleted: false
      })
      .returning("*");

    return request;
  }

  async getPendingRequests() {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .select(
        'mentor_requests.*',
        'teams.name as team_name',
        'users.name as leader_name',
        'users.email as leader_email'
      )
      .innerJoin('teams', 'mentor_requests.team_id', 'teams.team_id')
      .leftJoin('users', 'mentor_requests.created_by', 'users.user_id')
      .where({
        'mentor_requests.is_served': false,
        'mentor_requests.is_deleted': false,
        'mentor_requests.is_active': true
      })
      .orderBy("mentor_requests.created_at", "desc");
  }

  async markAsServed({ request_id, mentor_id }) {
    const db = await this.getQueryBuilder();

    const [request] = await db(this.table)
      .where({ id: request_id })
      .update({
        is_served: true,
        last_modified_by: mentor_id,
        updated_at: db.fn.now()
      })
      .returning("*");

    return request;
  }
  

}

module.exports = MentorRequestModel ;