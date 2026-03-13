const express = require('express');
const router = express.Router();
const JudgingManager = require('../../businessLogic/managers/JudgingManager');
const { appWrapper } = require('../../utils/routeWrapper');

// =============================================
// 🔹 JUDGING CRITERIA
// =============================================

// POST /judging/criteria/create
router.post(
  '/criteria/create',
  appWrapper(async (req, res) => {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const criteria = await JudgingManager.createCriteria(req.body, userId);
    res.json({ success: true, data: criteria, message: 'Criteria created successfully' });
  })
);

// GET /judging/criteria/by-event/:eventId
router.get(
  '/criteria/by-event/:eventId',
  appWrapper(async (req, res) => {
    const { eventId } = req.params;
    const criteria = await JudgingManager.getCriteriaByEvent(eventId);
    res.json({ success: true, data: criteria });
  })
);

// PUT /judging/criteria/update
router.put(
  '/criteria/update',
  appWrapper(async (req, res) => {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const criteria = await JudgingManager.updateCriteria(req.body, userId);
    res.json({ success: true, data: criteria, message: 'Criteria updated successfully' });
  })
);

// DELETE /judging/criteria/:criteriaId
router.delete(
  '/criteria/:criteriaId',
  appWrapper(async (req, res) => {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    await JudgingManager.deleteCriteria(req.params.criteriaId, userId);
    res.json({ success: true, message: 'Criteria deleted successfully' });
  })
);

// =============================================
// 🔹 JUDGING SCORES
// =============================================

// POST /judging/score/submit
router.post(
  '/score/submit',
  appWrapper(async (req, res) => {
    const userId = res.locals?.USER_INFO?.user?.user_id || null;
    const score = await JudgingManager.submitScore(req.body, userId);
    res.json({ success: true, data: score, message: 'Score submitted successfully' });
  })
);

// GET /judging/score/by-team/:teamId
router.get(
  '/score/by-team/:teamId',
  appWrapper(async (req, res) => {
    const scores = await JudgingManager.getScoresByTeam(req.params.teamId);
    res.json({ success: true, data: scores });
  })
);

// GET /judging/score/by-judge/:judgeId/team/:teamId
router.get(
  '/score/by-judge/:judgeId/team/:teamId',
  appWrapper(async (req, res) => {
    const { judgeId, teamId } = req.params;
    const scores = await JudgingManager.getScoresByJudgeAndTeam(judgeId, teamId);
    res.json({ success: true, data: scores });
  })
);

// GET /judging/score/total/:teamId  — Live sum of all criteria scores
router.get(
  '/score/total/:teamId',
  appWrapper(async (req, res) => {
    const result = await JudgingManager.getTeamTotalScore(req.params.teamId);
    res.json({ success: true, data: result });
  })
);

// GET /judging/leaderboard/:eventId
router.get(
  '/leaderboard/:eventId',
  appWrapper(async (req, res) => {
    const leaderboard = await JudgingManager.getLeaderboard(req.params.eventId);
    res.json({ success: true, data: leaderboard });
  })
);

module.exports = router;
