const MentorRequestModel = require("../../models/MentorRequestModel");
const { v4: uuidv4 } = require("uuid");

class MentorRequestManager {
  constructor() {
    this.mentorRequestModel = new MentorRequestModel();
  }

  async createMentorRequest({ team_id, user_id }) {
    const request = await this.mentorRequestModel.createRequest({
      team_id,
      created_by: user_id
    });

    return request;
  }

  async getPendingRequests() {
    return this.mentorRequestModel.getPendingRequests();
  }

  async acceptRequest({ request_id, mentor_id }) {
    const roomId = uuidv4();

    const request = await this.mentorRequestModel.markAsServed({
      request_id,
      mentor_id
    });

    return {
      ...request,
      room_id: roomId
    };
  }
}

module.exports = MentorRequestManager;