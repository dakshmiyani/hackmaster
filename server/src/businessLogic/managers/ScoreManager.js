const TeamScoreModel = require("../../models/TeamScoreModel");

class ScoreManager {
  static async submitScore(scoreData, io) {
    const { team_id, judge_id, domain, total_score, breakdown } = scoreData;

    if (!team_id || total_score === undefined || !domain) {
      throw new Error("Missing required score fields");
    }

    const model = new TeamScoreModel();
    const result = await model.saveScore({
      team_id,
      judge_id,
      domain,
      total_score,
      breakdown
    });

    // Notify all clients about the leaderboard update via Socket.io
    if (io) {
      io.emit("leaderboardUpdate", { domain });
    }

    return result;
  }

  static async getLeaderboard(domain) {
    const model = new TeamScoreModel();
    return await model.getLeaderboard(domain);
  }
}

module.exports = ScoreManager;
