const TeamModel = require("../../models/TeamModel");

class TeamManager {

  static async createTeam({ name, event_id, project_link,organization_id }, userId) {

    if (!name || !event_id) {
      throw new Error("Team name and event id are required");
    }

  
    const teamModel = new TeamModel(userId);

    const existing = await teamModel.findByNameAndEvent({
      name,
      event_id
    });

    if (existing) {
      throw new Error("Team already exists for this event");
    }

    return teamModel.create({
      name,
      event_id,
      project_link,
      organization_id
    });
  }

  static async getTeamsByEvent(event_id) {

   

    const teamModel = new TeamModel();

    return teamModel.findByEvent(event_id);
  }

  static async searchTeamsByName(name) {

    const teamModel = new TeamModel();

    return teamModel.searchByName(name);
  }

  static async updateTeam({ team_id, name, project_link }, userId) {

    if (!team_id) {
      throw new Error("team_id is required");
    }

    const teamModel = new TeamModel(userId);

    const team = await teamModel.findById(team_id);

    if (!team) {
      throw new Error("Team not found");
    }

    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (project_link !== undefined) {
      updateData.project_link = project_link;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nothing to update");
    }

    return teamModel.updateTeam(team_id, updateData);
  }

  static async getTeamLeader(team_id) {
    if (!team_id) throw new Error("team_id is required");
    const teamModel = new TeamModel();
    const leader = await teamModel.getTeamLeader(team_id);
    if (!leader) throw new Error("No team leader found for this team");
    return leader;
  }

}

module.exports = TeamManager;