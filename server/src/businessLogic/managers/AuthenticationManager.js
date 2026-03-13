const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/AuthModel");

class AuthenticationManager {

  static async registerUser(payload) {
    const { name, email, password, role_id, college, org_id, event_id, team_name } = payload;
    const userModel = new UserModel();
    const Db = require("../../models/libs/Db");
    const knex = await Db.getQueryBuilder();

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await knex.transaction(async (trx) => {
      // 1. Create User
      const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role_id
      }, trx);

      // 2. If Team Leader (Role 5), create Member entry too
      if (Number(role_id) === 5) {
        const MemberManager = require("./MemberManager");
        await MemberManager._createMemberInternal({
          name,
          email,
          college,
          org_id,
          event_id,
          team_name,
          isLeader: true   // ✅ Mark as team leader
        }, user.user_id, trx);
      }

      return user;
    });
  }

  static async loginUser({ email, password }) {

    const userModel = new UserModel();

    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    };
  }
}

module.exports = AuthenticationManager;