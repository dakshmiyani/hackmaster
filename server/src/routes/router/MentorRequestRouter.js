const express = require("express");
const router = express.Router();

const MentorRequestManager = require("../../businessLogic/managers/MentorRequestManager");
const { getIO } = require("../../utils/socket");
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, '../../../socket-debug.log');

const log = (msg) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
  console.log(msg);
};

const mentorRequestManager = new MentorRequestManager();

/**
 * Team leader requests mentoring
 */
router.post("/request-mentoring", async (req, res) => {
  try {
    const { team_id, user_id } = req.body;

    const request = await mentorRequestManager.createMentorRequest({
      team_id,
      user_id,
    });

    // emit realtime event to mentors
    const io = getIO();
    io.emit("new-mentor-request", request);

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Mentor request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create mentor request",
    });
  }
});

/**
 * Mentor dashboard fetches pending requests
 */
router.get("/pending-requests", async (req, res) => {
  try {
    const requests = await mentorRequestManager.getPendingRequests();

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Fetch requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch mentor requests",
    });
  }
});

/**
 * Mentor accepts request
 */
router.post("/accept-request", async (req, res) => {
  try {
    const { request_id, mentor_id } = req.body;
    log(`[API DEBUG] POST /accept-request - request_id: ${request_id}, mentor_id: ${mentor_id}`);

    const result = await mentorRequestManager.acceptRequest({
      request_id,
      mentor_id,
    });
    log(`[API DEBUG] acceptRequest result: ${JSON.stringify(result)}`);

    const io = getIO();

    // Fetch mentor name for better notification
    const UserModel = require("../../models/AuthModel");
    const userModel = new UserModel();
    const mentor = await userModel.getById(mentor_id);
    
    const notificationData = {
      ...result,
      mentor_name: mentor ? mentor.name : "A Mentor"
    };

    // notify team leader that mentor accepted using team-specific room
    const roomName = `team-${result.team_id}`;
    const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
    log(`[SOCKET DEBUG] Emitting mentor-request-accepted to ${roomName}. Sockets in room: ${socketsInRoom ? Array.from(socketsInRoom).join(', ') : 'none'}`);
    
    io.to(roomName).emit("mentor-request-accepted", notificationData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Accept request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to accept mentor request",
    });
  }
});

module.exports = router;