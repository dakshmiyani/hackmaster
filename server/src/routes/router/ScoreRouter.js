const express = require("express");
const ScoreManager = require("../../businessLogic/managers/ScoreManager");
const { appWrapper } = require("../../utils/routeWrapper");
const { ACCESS_ROLES } = require("../../businessLogic/accessmanagement/roleConstants");

const router = express.Router();

/**
 * POST /submit
 * Submit judge marks for a team
 */
router.post(
  "/submit",
  appWrapper(
    async (req, res) => {
      const scoreData = req.body;
      const io = req.app.get("socketio"); // Assuming socketio is set on app
      
      const result = await ScoreManager.submitScore(scoreData, io);

      return res.json({
        success: true,
        data: result,
        message: "Score submitted successfully"
      });
    },
    [ACCESS_ROLES.ALL]
  )
);

/**
 * GET /leaderboard/:domain
 * Fetch the leaderboard for a specific domain
 */
router.get(
  "/leaderboard/:domain",
  appWrapper(
    async (req, res) => {
      const { domain } = req.params;
      const leaderboard = await ScoreManager.getLeaderboard(domain);

      return res.json({
        success: true,
        data: leaderboard,
        message: "Leaderboard fetched successfully"
      });
    },
    [ACCESS_ROLES.ALL]
  )
);

module.exports = router;
