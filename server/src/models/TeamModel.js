const BaseModel = require("./libs/BaseModel");

class TeamModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "teams";
  }

  async create({ name, event_id, project_link, organization_id, domain }, trx) {

    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      event_id,
      project_link,
      organization_id,
      domain
    });

    const [team] = await (trx || db)(this.table)
      .insert(insertData)
      .returning("*");

    return team;
  }

  async getAllTeams(filters = {}, trx) {
    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .select(`${this.table}.*`, "events.name as event_name")
      .leftJoin("events", `${this.table}.event_id`, "events.event_id")
      .where(`${this.table}.is_deleted`, false)
      .modify((query) => {
        if (filters.event_id) query.where(`${this.table}.event_id`, filters.event_id);
        if (filters.organization_id) query.where(`${this.table}.organization_id`, filters.organization_id);
        if (filters.domain) query.where(`${this.table}.domain`, filters.domain);
      });
  }

  async findByNameAndEvent({ name, event_id }, trx) {

    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .where(this.whereStatement({ name, event_id }))
      .first();
  }

  async findByEvent(event_id, trx) {

    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .select(`${this.table}.*`, "events.name as event_name")
      .leftJoin("events", `${this.table}.event_id`, "events.event_id")
      .where(`${this.table}.is_deleted`, false)
      .andWhere(`${this.table}.event_id`, event_id);
  }

  async findById(team_id, trx) {
    const db = await this.getQueryBuilder();
    return (trx || db)(this.table)
      .where(this.whereStatement({ team_id }))
      .first();
  }

  async findByTeamLeader(user_id, trx) {
    const db = await this.getQueryBuilder();
    return (trx || db)(this.table)
      .where(this.whereStatement({ created_by: user_id }))
      .first();
  }

  async searchByName(name, trx) {

    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .where("name", "ilike", `%${name}%`)
      .andWhere(this.whereStatement());
  }

  async updateTeam(team_id, updateData, trx) {

    const db = await this.getQueryBuilder();

    const updateStatement = await this.updateStatement(updateData);

    const [team] = await (trx || db)(this.table)
      .where({ team_id })
      .update(updateStatement)
      .returning("*");

    return team;
  }

}

module.exports = TeamModel;