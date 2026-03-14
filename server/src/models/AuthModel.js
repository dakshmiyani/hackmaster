const BaseModel = require("../models/libs/BaseModel");

class UserModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "users";
  }

  async create({ name, email, password, role_id }) {

    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      email,
      password,
      role_id
    });

    const [user] = await db(this.table)
      .insert(insertData)
      .returning(["user_id", "name", "email", "role_id"]);

    return user;
  }

  async findByEmail(email) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ email }))
      .first();
  }

  async getById(userId) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where({ user_id: userId })
      .first();
  }

  async getUserRoleById(email) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    return {
      roles: [{ role_id: user.role_id, name: 'admin' }]
    };
  }

}

module.exports = UserModel;