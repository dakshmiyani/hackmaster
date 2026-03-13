const BaseModel = require("./libs/BaseModel");

class JudgingCriteriaModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "judging_criteria";
  }

  async create({ event_id, criteria_name, criteria_max_score }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      event_id,
      criteria_name,
      criteria_max_score
    });

    const [criteria] = await db(this.table)
      .insert(insertData)
      .returning("*");

    return criteria;
  }

  async findById(judging_criteria_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ judging_criteria_id }))
      .first();
  }

  async findByEvent(event_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .leftJoin("events", "judging_criteria.event_id", "events.event_id")
      .where(this.whereStatement({ event_id }))
      .select("judging_criteria.*", "events.name as event_name");
  }

  async update(judging_criteria_id, updateData) {
    const db = await this.getQueryBuilder();
    const updateStatement = await this.updateStatement(updateData);
    const [criteria] = await db(this.table)
      .where({ judging_criteria_id })
      .update(updateStatement)
      .returning("*");
    return criteria;
  }

  async delete(judging_criteria_id) {
    const db = await this.getQueryBuilder();
    const updateStatement = await this.updateStatement({ is_deleted: true, is_active: false });
    return db(this.table)
      .where({ judging_criteria_id })
      .update(updateStatement);
  }
}

module.exports = JudgingCriteriaModel;
