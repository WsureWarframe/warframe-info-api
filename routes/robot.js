const express = require('express');
const robotJson = require("../utils/dict/robot.json");
const router = express.Router();

router.all('/commands',function (req,res) {
  res.json(robotJson.commands)
});

module.exports = router;
