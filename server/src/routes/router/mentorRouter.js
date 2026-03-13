const express = require('express');
const router = express.Router();
const MentorManager = require('../../businessLogic/managers/MentorManager');
const { getIO } = require('../../utils/socket');

const mentorManager = new MentorManager();

// Leader → Send mentor request
// POST /api/mentor/request
router.post('/request', async (req, res, next) => {
  try {
    const { team_id, team_name, leader_name, problem_statement, category } = req.body;
    const leader_email = res.locals.userInfo.user.email;

    const request = await mentorManager.createRequest({
      team_id, team_name, leader_name,
      leader_email, problem_statement, category
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// Mentor → See all pending requests
// GET /api/mentor/requests
router.get('/requests', async (req, res, next) => {
  try {
    const requests = await mentorManager.getPendingRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// Leader → See their team's requests
// GET /api/mentor/my-requests?team_id=123
router.get('/my-requests', async (req, res, next) => {
  try {
    const { team_id } = req.query;
    const requests = await mentorManager.getTeamRequests(team_id);
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// Mentor → Accept a request (triggers socket event)
// POST /api/mentor/accept/:id
router.post('/accept/:id', async (req, res, next) => {
  try {
    const mentor = res.locals.userInfo.user;
    const updated = await mentorManager.acceptRequest(req.params.id, mentor);

    // 🔥 Emit socket event to notify team leader
    const io = getIO();
    io.to(`team-${updated.team_id}`).emit('mentor-joined', {
      mentorName: updated.mentor_name,
      roomId: updated.room_id,
      message: `${updated.mentor_name} accepted your request. Join the meeting!`
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;