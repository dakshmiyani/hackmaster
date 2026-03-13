const MentorModel = require('../../models/MentorModel');
const { v4: uuidv4 } = require('uuid');

class MentorManager {

  constructor() {
    this.mentorModel = new MentorModel();
  }

  // Leader creates a mentor request
  async createRequest(requestData) {
    const existing = await this.mentorModel.db('mentor_requests')
      .where({ team_id: requestData.team_id, status: 'pending' })
      .first();

    if (existing) {
      throw new Error('A pending request already exists for this team');
    }

    return await this.mentorModel.createRequest(requestData);
  }

  // Mentor sees all pending requests
  async getPendingRequests() {
    return await this.mentorModel.getAllPendingRequests();
  }

  // Leader sees their own requests
  async getTeamRequests(team_id) {
    return await this.mentorModel.getRequestsByTeam(team_id);
  }

  // Mentor accepts a request → generates roomId for video call
  async acceptRequest(requestId, mentor) {
    const request = await this.mentorModel.getRequestById(requestId);

    if (!request) throw new Error('Request not found');
    if (request.status === 'accepted') throw new Error('Already accepted');

    const room_id = uuidv4(); // unique video call room

    const updated = await this.mentorModel.acceptRequest(requestId, {
      mentor_id: mentor.user_id,
      mentor_name: mentor.name,
      room_id
    });

    return updated; // contains room_id → used for socket emit + video call
  }

}

module.exports = MentorManager;