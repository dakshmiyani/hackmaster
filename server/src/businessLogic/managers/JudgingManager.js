const JudgingCriteriaModel = require("../../models/JudgingCriteriaModel");
const JudgingScoreModel = require("../../models/JudgingScoreModel");

class JudgingManager {

  // =============================================
  // 🔹 CRITERIA
  // =============================================

  static async createCriteria({ event_id, criteria_name, criteria_max_score }, userId) {
    if (!event_id || !criteria_name || !criteria_max_score) {
      throw new Error("event_id, criteria_name and criteria_max_score are required");
    }

    const model = new JudgingCriteriaModel(userId);
    return model.create({ event_id, criteria_name, criteria_max_score });
  }

  static async getCriteriaByEvent(event_id) {
    if (!event_id) throw new Error("event_id is required");
    const model = new JudgingCriteriaModel();
    return model.findByEvent(event_id);
  }

  static async updateCriteria({ judging_criteria_id, criteria_name, criteria_max_score }, userId) {
    if (!judging_criteria_id) throw new Error("judging_criteria_id is required");

    const model = new JudgingCriteriaModel(userId);
    const existing = await model.findById(judging_criteria_id);
    if (!existing) throw new Error("Criteria not found");

    const updateData = {};
    if (criteria_name !== undefined) updateData.criteria_name = criteria_name;
    if (criteria_max_score !== undefined) updateData.criteria_max_score = criteria_max_score;

    if (Object.keys(updateData).length === 0)
      throw new Error("Nothing to update");

    return model.update(judging_criteria_id, updateData);
  }

  static async deleteCriteria(judging_criteria_id, userId) {
    if (!judging_criteria_id) throw new Error("judging_criteria_id is required");
    const model = new JudgingCriteriaModel(userId);
    const existing = await model.findById(judging_criteria_id);
    if (!existing) throw new Error("Criteria not found");
    return model.delete(judging_criteria_id);
  }

  // =============================================
  // 🔹 SCORES
  // =============================================

  static async submitScore({ judge_id, team_id, criteria_id, total_score }, userId) {
    if (!judge_id || !team_id || !criteria_id || total_score === undefined) {
      throw new Error("judge_id, team_id, criteria_id and total_score are required");
    }

    const criteriaModel = new JudgingCriteriaModel(userId);
    const criteria = await criteriaModel.findById(criteria_id);
    if (!criteria) throw new Error("Judging criteria not found");

    if (total_score < 0 || total_score > criteria.criteria_max_score) {
      throw new Error(`Score must be between 0 and ${criteria.criteria_max_score}`);
    }

    const scoreModel = new JudgingScoreModel(userId);

    // Prevent duplicate scoring – upsert pattern
    const existing = await scoreModel.findExistingScore(judge_id, team_id, criteria_id);

    if (existing) {
      // Update existing score
      return scoreModel.update(existing.judging_score_id, { total_score });
    }

    return scoreModel.create({ judge_id, team_id, criteria_id, total_score });
  }

  static async getScoresByTeam(team_id) {
    if (!team_id) throw new Error("team_id is required");
    const scoreModel = new JudgingScoreModel();
    return scoreModel.findByTeam(team_id);
  }

  static async getScoresByJudgeAndTeam(judge_id, team_id) {
    if (!judge_id || !team_id) throw new Error("judge_id and team_id are required");
    const scoreModel = new JudgingScoreModel();
    return scoreModel.findByJudgeAndTeam(judge_id, team_id);
  }

  static async getLeaderboard(event_id) {
    if (!event_id) throw new Error("event_id is required");
    const scoreModel = new JudgingScoreModel();
    return scoreModel.getEventLeaderboard(event_id);
  }

  static async getTeamTotalScore(team_id) {
    if (!team_id) throw new Error("team_id is required");
    const scoreModel = new JudgingScoreModel();
    return scoreModel.getTeamTotalScore(team_id);
  }
}

module.exports = JudgingManager;
