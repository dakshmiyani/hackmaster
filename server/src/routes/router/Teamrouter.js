const express = require("express");
const router = express.Router();

const TeamManager = require("../../businessLogic/managers/TeamManager");
const {appWrapper} = require("../../utils/routeWrapper");


// CREATE TEAM
const { ACCESS_ROLES } = require("../../businessLogic/accessmanagement/roleConstants");

router.post(
  "/create",
  appWrapper(async (req, res) => {

    const userId = res.locals?.USER_INFO?.user?.user_id || null;

    const team = await TeamManager.createTeam(req.body, userId);

    res.json({
      success: true,
      data: team,
      message: "Team created successfully"
    });

  }, [ACCESS_ROLES.ALL])   // ✅ allow everyone
);

router.get(
  "/all-teams",
  appWrapper(async (req, res) => {
    const teams = await TeamManager.getAllTeams(req.query);
    res.json({ success: true, data: teams });
  })
);

// GET TEAMS BY EVENT
router.get(
  "/by-event/:eventId",
  appWrapper(async (req, res) => {

    const { eventId } = req.params;

    const teams = await TeamManager.getTeamsByEvent(eventId);

    res.json({
      success: true,
      data: teams
    });

  })
);


// SEARCH TEAM BY NAME
router.get(
  ["/by-name/:name", "/by-name"],
  appWrapper(async (req, res) => {

    const name = req.params.name || req.query.name;

    const teams = await TeamManager.searchTeamsByName(name);

    res.json({
      success: true,
      data: teams
    });

  })
);


// UPDATE TEAM
router.put(
  "/update",
  appWrapper(async (req, res) => {

    const userId = res.locals?.USER_INFO?.user?.user_id || null;

    const updatedTeam = await TeamManager.updateTeam(
      req.body,
      userId
    );

    res.json({
      success: true,
      data: updatedTeam,
      message: "Team updated successfully"
    });

  })
);

module.exports = router;