const BaseModel = require("./libs/BaseModel");

class QrScanModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "qr_scans";
  }

  async hasScannedMeal(member_id, meal_id) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where({ member_id, meal_id })
      .first();
  }

  async createScan({ member_id, org_id, event_id, meal_id }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      member_id,
      org_id,
      event_id,
      meal_id
    });

    const [scan] = await db(this.table)
      .insert(insertData)
      .returning("*");

    return scan;
  }
}

module.exports = QrScanModel;
