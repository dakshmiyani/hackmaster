const BaseModel = require('./libs/BaseModel');

class MentorModel extends BaseModel {

  async createRequest({ team_id, team_name, leader_name, leader_email, problem_statement, category }) {
    const [request] = await this.db('mentor_requests')
      .insert({ team_id, team_name, leader_name, leader_email, problem_statement, category })
      .returning('*');
    return request;
  }

  async getAllPendingRequests() {
    return await this.db('mentor_requests')
      .where({ status: 'pending' })
      .orderBy('created_at', 'desc');
  }

  async getRequestsByTeam(team_id) {
    return await this.db('mentor_requests')
      .where({ team_id })
      .orderBy('created_at', 'desc');
  }

  async acceptRequest(id, { mentor_id, mentor_name, room_id }) {
    const [updated] = await this.db('mentor_requests')
      .where({ id })
      .update({ mentor_id, mentor_name, room_id, status: 'accepted' })
      .returning('*');
    return updated;
  }

  async getRequestById(id) {
    return await this.db('mentor_requests').where({ id }).first();
  }

}

module.exports = MentorModel;