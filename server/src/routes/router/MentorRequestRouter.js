const express = require("express");
const router = express.Router();

const MentorRequestManager = require("../../businessLogic/managers/MentorRequestManager");
const { getIO } = require("../../utils/socket");

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

    const result = await mentorRequestManager.acceptRequest({
      request_id,
      mentor_id,
    });

    const io = getIO();

    // notify team leader that mentor accepted
    io.emit("mentor-request-accepted", result);

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