const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/AuthModel");

class AuthenticationManager {

  static async registerUser({ name, email, password, role_id }) {

    const userModel = new UserModel();

    const existing = await userModel.findByEmail(email);

    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return userModel.create({
      name,
      email,
      password: hashedPassword,
      role_id
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
        user_id: user.user_id || user.id,
        email: user.email
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    let team_id = null;
    if (user.role_id === 5) {
      const TeamModel = require("../../models/TeamModel");
      const teamModel = new TeamModel();
      const team = await teamModel.findByTeamLeader(user.user_id || user.id);
      if (team) {
        team_id = team.team_id || team.id;
      }
    }

    return {
      token,
      user: {
        id: user.user_id || user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        team_id
      }
    };
  }
}

module.exports = AuthenticationManager;