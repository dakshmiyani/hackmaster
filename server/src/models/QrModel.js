const BaseModel = require("./libs/BaseModel");

class QrModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "qrs";
  }

  async createBase(trx) {
    const db = await this.getQueryBuilder();

    const [qr] = await (trx || db)(this.table)
      .insert({
        qr_code: "temp",
        qr_url: "temp",
        member_id: null
      })
      .returning("*");

    return qr;
  }

  async updateQRUrl(qr_id, qr_code, qr_url, trx) {
    const db = await this.getQueryBuilder();

    const [qr] = await (trx || db)(this.table)
      .where({ qr_id })
      .update({
        qr_code,
        qr_url
      })
      .returning("*");
      
    return qr;
  }

  async findByCode(qr_code) {
    const db = await this.getQueryBuilder();

    return db(this.table).where({ qr_code }).first();
  }

  async findByMemberId(member_id) {
    const db = await this.getQueryBuilder();

    return db(this.table).where({ member_id }).first();
  }

  async assignToMember({ qr_code, member_id }) {
    const db = await this.getQueryBuilder();

    const [qr] = await db(this.table)
      .where({ qr_code, member_id: null })
      .update({ member_id }, "*");

    return qr;
  }

  async updateAssignment({ qr_code, member_id }) {
    const db = await this.getQueryBuilder();

    const [qr] = await db(this.table)
      .where({ qr_code })
      .update({ member_id }, "*");

    return qr;
  }
}

module.exports = QrModel;