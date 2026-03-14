const BaseModel = require("./libs/BaseModel");

class TeamScoreModel extends BaseModel {
  constructor(userId) {
    super(userId);
    this.table = "team_scores";
  }

  async saveScore({ team_id, judge_id, domain, total_score, breakdown }) {
    const db = await this.getQueryBuilder();
    
    // Check if score already exists for this team/judge/domain combo to decide between insert or update
    const existing = await db(this.table)
      .where({ team_id, domain })
      .first();

    if (existing) {
      const [updated] = await db(this.table)
        .where({ id: existing.id })
        .update({
          total_score,
          breakdown: JSON.stringify(breakdown),
          updated_at: db.fn.now()
        })
        .returning("*");
      return updated;
    } else {
      const [inserted] = await db(this.table)
        .insert({
          team_id,
          judge_id,
          domain,
          total_score,
          breakdown: JSON.stringify(breakdown)
        })
        .returning("*");
      return inserted;
    }
  }

  async getLeaderboard(domain) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .innerJoin("teams", "team_scores.team_id", "teams.team_id")
      .select(
        "teams.team_id",
        "teams.name as team_name",
        "team_scores.total_score",
        "team_scores.domain"
      )
      .where("team_scores.domain", domain)
      .orderBy("team_scores.total_score", "desc");
  }
}

module.exports = TeamScoreModel;
