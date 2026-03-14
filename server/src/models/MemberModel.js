const BaseModel = require("./libs/BaseModel");

class MemberModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "members";
  }

  async create({ name, email, college, org_id, event_id }, trx) {

    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      email,
      college,
      org_id,
      event_id
    });

    const [member] = await (trx || db)(this.table)
      .insert(insertData)
      .returning("*");

    return member;
  }

  async findByEmailAndEvent({ email, event_id }, trx) {
    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .where(this.whereStatement({ email, event_id }))
      .first();
  }

  async findById(id, trx) {
    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .where(this.whereStatement({ member_id: id }))
      .first();
  }

  async updateMember(member_id, updateData, trx) {
    const db = await this.getQueryBuilder();

    const updateStatement = await this.updateStatement(updateData);

    const [member] = await (trx || db)(this.table)
      .where({ member_id: member_id })
      .update(updateStatement)
      .returning("*");

    return member;
  }

  async searchMembers({ event_id, name }, trx) {
    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .leftJoin("team_members", "members.member_id", "team_members.member_id")
      .leftJoin("teams", "team_members.team_id", "teams.team_id")
      .where("members.event_id", event_id)
      .andWhere(function () {
        this.where("members.name", "ilike", `%${name}%`)
          .orWhere("teams.name", "ilike", `%${name}%`);
      })
      .select(
        "members.member_id",
        "members.name",
        "members.email",
        "members.college",
        "teams.name as team_name",
        "teams.team_id"
      );
  }

  async getAll(trx) {
    const db = await this.getQueryBuilder();

    return (trx || db)(this.table)
      .where(this.whereStatement());
  }

}

module.exports = MemberModel;