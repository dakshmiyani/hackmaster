const BaseModel = require("./libs/BaseModel");

class TeamModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "teams";
  }

  async create({ name, event_id, project_link,organization_id }) {

    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      event_id,
      project_link,
      organization_id
    });

    const [team] = await db(this.table)
      .insert(insertData)
      .returning("*");

    return team;
  }

  async findByNameAndEvent({ name, event_id }) {

    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(this.whereStatement({ name, event_id }))
      .first();
  }

  async findByEvent(event_id) {

    const db = await this.getQueryBuilder();

    return db(this.table)
      .leftJoin("events", "teams.event_id", "events.event_id")
      .where(this.whereStatement({ event_id }))
      .select("teams.*", "events.name as event_name");
  }

  // Slot and addMemberToTeam logic removed as we use team_members junction table now

  async searchByName(name) {

    const db = await this.getQueryBuilder();

    return db(this.table)
      .where("name", "ilike", `%${name}%`)
      .andWhere(this.whereStatement());
  }

  async updateTeam(team_id, updateData) {

    const db = await this.getQueryBuilder();

    const updateStatement = await this.updateStatement(updateData);

    const [team] = await db(this.table)
      .where({ team_id })
      .update(updateStatement)
      .returning("*");

    return team;
  }

  async findById(team_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ team_id }))
      .first();
  }

  async getTeamLeader(team_id) {
    const db = await this.getQueryBuilder();
    return db("team_members")
      .join("members", "team_members.member_id", "members.member_id")
      .where("team_members.team_id", team_id)
      .andWhere("team_members.is_leader", true)
      .select(
        "members.member_id",
        "members.name",
        "members.email",
        "members.college",
        "team_members.is_leader"
      )
      .first();
  }

}

module.exports = TeamModel;