const MemberModel = require("../../models/MemberModel");
const TeamModel = require("../../models/TeamModel");
const Db = require("../../models/libs/Db");

class MemberManager {

  static async createMember({ name, email, college, team_name, event_id, org_id }, userId) {

    const knex = await Db.getQueryBuilder();
    const memberModel = new MemberModel(userId);
    const teamModel = new TeamModel(userId);

    if (!name || !email || !event_id || !org_id) {
       throw new Error("Missing required member fields (name, email, event_id, org_id)");
    }

    return await knex.transaction(async (trx) => {

      // 1. Check if member already exists for this event
      let member = await memberModel.findByEmailAndEvent({ email, event_id }, trx);

      if (member) {
        throw new Error("Member already registered for this event");
      }

      // 2. Create the member
      member = await memberModel.create({
        name,
        email,
        college,
        org_id,
        event_id
      }, trx);

      let team = null;

      // 3. Handle Team Association (If team_name is provided)
      if (team_name) {
        const cleanTeamName = team_name.toString().trim();

        // Find existing team for this event
        team = await teamModel.findByNameAndEvent({ name: cleanTeamName, event_id }, trx);

        // Or create new team
        if (!team) {
          team = await teamModel.create({
            name: cleanTeamName,
            event_id,
            organization_id: org_id
          }, trx);
        }

        // 4. Map the member to the team via junction table
        await trx("team_members").insert({
          team_id: team.team_id,
          member_id: member.member_id
        });
      }

      return {
        member_id: member.member_id,
        team_id: team ? team.team_id : null,
        message: 'Member registered successfully'
      };
    });

  }

  static async updateMember({ member_id, name, email, college }, userId) {
    if (!member_id) {
      throw new Error("member_id is required");
    }

    const memberModel = new MemberModel(userId);
    const member = await memberModel.findById(member_id);

    if (!member) {
      throw new Error("Member not found");
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (college !== undefined) updateData.college = college;

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nothing to update");
    }

    return await memberModel.updateMember(member_id, updateData);
  }

  static async searchMembers({ name, event_id }) {
    if (!event_id) throw new Error("event_id required for searching");

    const memberModel = new MemberModel();
    return await memberModel.searchMembers({ name, event_id });
  }

  static async getMemberById(id) {
    const memberModel = new MemberModel();
    return await memberModel.findById(id);
  }

  static async getMembers() {
    const memberModel = new MemberModel();
    return memberModel.getAll();
  }

}

module.exports = MemberManager;