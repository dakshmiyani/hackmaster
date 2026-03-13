const express = require("express");
const router = express.Router();
const AuthenticationManager = require("../../businessLogic/managers/AuthenticationManager");

// REGISTER
router.post("/register", async (req, res) => {
  try {

    const user = await AuthenticationManager.registerUser(req.body);

    res.json({
      success: true,
      data: user,
      message: "User registered successfully"
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {

    const data = await AuthenticationManager.loginUser(req.body);

    res.json({
      success: true,
      data,
      message: "Login successful"
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
});

module.exports = router;