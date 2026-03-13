const BaseModel = require("./libs/BaseModel");

class JudgingScoreModel extends BaseModel {

  constructor(userId) {
    super(userId);
    this.table = "judging_scores";
  }

  async create({ judge_id, team_id, criteria_id, total_score }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      judge_id,
      team_id,
      criteria_id,
      total_score
    });

    const [score] = await db(this.table)
      .insert(insertData)
      .returning("*");

    return score;
  }

  async findById(judging_score_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ judging_score_id }))
      .first();
  }

  async findByTeam(team_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .join("judging_criteria", "judging_scores.criteria_id", "judging_criteria.judging_criteria_id")
      .join("events", "judging_criteria.event_id", "events.event_id")
      .join("users", "judging_scores.judge_id", "users.user_id")
      .where("judging_scores.team_id", team_id)
      .andWhere("judging_scores.is_deleted", false)
      .select(
        "judging_scores.*",
        "judging_criteria.criteria_name",
        "judging_criteria.criteria_max_score",
        "events.event_id",
        "events.name as event_name",
        "users.name as judge_name"
      );
  }

  async findByJudgeAndTeam(judge_id, team_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .join("judging_criteria", "judging_scores.criteria_id", "judging_criteria.judging_criteria_id")
      .join("events", "judging_criteria.event_id", "events.event_id")
      .where("judging_scores.judge_id", judge_id)
      .andWhere("judging_scores.team_id", team_id)
      .andWhere("judging_scores.is_deleted", false)
      .select(
        "judging_scores.*",
        "judging_criteria.criteria_name",
        "judging_criteria.criteria_max_score",
        "events.event_id",
        "events.name as event_name"
      );
  }

  async findExistingScore(judge_id, team_id, criteria_id) {
    const db = await this.getQueryBuilder();
    return db(this.table)
      .where(this.whereStatement({ judge_id, team_id, criteria_id }))
      .first();
  }

  async update(judging_score_id, updateData) {
    const db = await this.getQueryBuilder();
    const updateStatement = await this.updateStatement(updateData);
    const [score] = await db(this.table)
      .where({ judging_score_id })
      .update(updateStatement)
      .returning("*");
    return score;
  }

  async getEventLeaderboard(event_id) {
    const db = await this.getQueryBuilder();

    // Use a CTE + RANK() window function so teams are ranked by total score
    const rows = await db.raw(`
      WITH team_totals AS (
        SELECT
          js.team_id,
          t.name AS team_name,
          e.event_id,
          e.name AS event_name,
          SUM(js.total_score) AS total_score,
          COUNT(js.judging_score_id) AS criteria_scored
        FROM judging_scores js
        JOIN teams t ON js.team_id = t.team_id
        JOIN judging_criteria jc ON js.criteria_id = jc.judging_criteria_id
        JOIN events e ON jc.event_id = e.event_id
        WHERE jc.event_id = ?
          AND js.is_deleted = false
        GROUP BY js.team_id, t.name, e.event_id, e.name
      )
      SELECT
        *,
        RANK() OVER (ORDER BY total_score DESC) AS rank
      FROM team_totals
      ORDER BY rank ASC
    `, [event_id]);

    return rows.rows;
  }

  // Returns live sum of all criteria scores for a team, with per-criteria breakdown
  async getTeamTotalScore(team_id) {
    const db = await this.getQueryBuilder();

    const breakdown = await db(this.table)
      .join("judging_criteria", "judging_scores.criteria_id", "judging_criteria.judging_criteria_id")
      .where("judging_scores.team_id", team_id)
      .andWhere("judging_scores.is_deleted", false)
      .select(
        "judging_criteria.judging_criteria_id as criteria_id",
        "judging_criteria.criteria_name",
        "judging_criteria.criteria_max_score",
        db.raw("SUM(judging_scores.total_score) as score")
      )
      .groupBy(
        "judging_criteria.judging_criteria_id",
        "judging_criteria.criteria_name",
        "judging_criteria.criteria_max_score"
      );

    const total_score = breakdown.reduce((sum, c) => sum + Number(c.score), 0);
    const max_possible_score = breakdown.reduce((sum, c) => sum + Number(c.criteria_max_score), 0);

    return {
      team_id,
      total_score,
      max_possible_score,
      criteria_breakdown: breakdown
    };
  }
}

module.exports = JudgingScoreModel;
