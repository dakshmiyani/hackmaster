const express = require("express");
const router = express.Router();
const AdminManager = require("../../businessLogic/managers/AdminManager");
const { appWrapper } = require("../../utils/routeWrapper");

const BroadcastModel = require("../../models/BroadcastModel");
const { getIO } = require("../../utils/socket");

// GET DASHBOARD STATS
router.get(
  "/stats",
  appWrapper(async (req, res) => {
    const stats = await AdminManager.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  })
);

// SEND BROADCAST
router.post(
  "/broadcast",
  appWrapper(async (req, res) => {
    try {
      const { message } = req.body;
      const userId = res.locals?.USER_INFO?.user?.user_id || null;

      console.log("Creating broadcast:", message, "from user:", userId);

      if (!message) throw new Error("Message is required");

      const broadcastModel = new BroadcastModel(userId);
      const broadcast = await broadcastModel.create({ message, admin_id: userId });

      // Emit via Socket.io
      const io = getIO();
      console.log("Emitting broadcast to all clients:", broadcast);
      io.emit("new-broadcast", broadcast);

      res.json({
        success: true,
        data: broadcast
      });
    } catch (error) {
      console.error("BROADCAST SEND ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error during broadcast",
        error: error.message
      });
    }
  })
);

// GET BROADCASTS
router.get(
  "/broadcasts",
  appWrapper(async (req, res) => {
    try {
      console.log("Fetching broadcasts via Model...");
      const broadcastModel = new BroadcastModel();
      const list = await broadcastModel.getAll();
      console.log("Broadcasts fetched count:", list.length);
      res.json({
        success: true,
        data: list
      });
    } catch (error) {
      console.error("BROADCASTS FETCH ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetch",
        error: error.message
      });
    }
  })
);

// EXPORT TO EXCEL
router.get(
  "/export-excel",
  appWrapper(async (req, res) => {
    const buffer = await AdminManager.exportToExcel();
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Hackmaster_Data.xlsx"
    );
    
    res.send(buffer);
  })
);

// EXPORT LEADERBOARD TO EXCEL
router.get(
  "/leaderboard/export",
  appWrapper(async (req, res) => {
    const { domain } = req.query;
    const buffer = await AdminManager.exportLeaderboardToExcel(domain);
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Leaderboard_${domain || 'all'}.xlsx`
    );
    
    res.send(buffer);
  })
);

// GET LEADERBOARD DATA
router.get(
  "/leaderboard",
  appWrapper(async (req, res) => {
    const { domain } = req.query;
    const data = await AdminManager.getLeaderboard(domain);
    res.json({
      success: true,
      data
    });
  })
);

module.exports = router;
