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

  async getAllTeams(filters = {}) {
  const db = await this.getQueryBuilder();

  return db(this.table)
    .select(`${this.table}.*`, "events.name as event_name")
    .leftJoin("events", `${this.table}.event_id`, "events.id")
    .where(`${this.table}.is_deleted`, false)
    .modify((query) => {
      if (filters.event_id) query.where(`${this.table}.event_id`, filters.event_id);
      if (filters.organization_id) query.where(`${this.table}.organization_id`, filters.organization_id);
    });
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
      .select(`${this.table}.*`, "events.name as event_name")
      .leftJoin("events", `${this.table}.event_id`, "events.id")
      .where(`${this.table}.is_deleted`, false)
      .andWhere(`${this.table}.event_id`, event_id);
  }

  // Slot and addMemberToTeam logic removed as we use team_members junction table now

  async findByTeamLeader(user_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where({ created_by: user_id, is_deleted: false })
      .first();
  }

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

}

module.exports = TeamModel;