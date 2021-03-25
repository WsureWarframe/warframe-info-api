const express = require('express');
const robotJson = require("../utils/dict/robot.json");
const router = express.Router();
const utils = require('../utils/utils')

const requestCache = utils.customerRecord.request
const menuCache = utils.customerRecord.menu

router.all('/commands',function (req,res) {
  res.json(robotJson.commands)
});

router.all('/menuCache',function (req,res) {
  let cache = menuCache.keys().map( key => menuCache.get(key))
  res.json(cache)
});
router.all('/requestCache',function (req,res) {
  let cache = requestCache.keys().map( key => requestCache.get(key))
  res.json(cache)
});
module.exports = router;
