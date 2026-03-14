const BaseModel = require("./libs/BaseModel");

class BroadcastModel extends BaseModel {
  constructor(userId) {
    super(userId);
    this.table = "broadcasts";
  }

  async create({ message, admin_id }) {
    const db = await this.getQueryBuilder();
    const [broadcast] = await db(this.table)
      .insert({
        message,
        admin_id,
        created_at: new Date()
      })
      .returning("*");
    return broadcast;
  }

  async getAll() {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .orderBy("created_at", "desc")
      .limit(20);
  }
}

module.exports = BroadcastModel;
