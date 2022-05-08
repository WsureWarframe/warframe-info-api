const express = require('express');
const robotJson = require("../service/robot/robot.json");
const router = express.Router();
const utils = require('../utils/utils');
const robotUtils = require('../service/robot')

const requestCache = utils.customerRecord.request
const menuCache = utils.customerRecord.menu

const timeout = 2 * 60 * 1000;

router.all('/commands',function (req,res) {
  res.json(robotJson.commands)
});

router.all('/kukubot/commands',function (req,res) {
  res.json(robotJson.kkbCommands)
});

router.all('/tasks',function (req,res) {
  res.json(robotJson.tasks)
});

router.all(['/queue/wf/:type','/queue/wf/'],async function (req,res) {
  let type = req.params.type || req.query.type
  res.json(await robotUtils.taskQueue(type))
});

router.all(['/info/wf/:type/:key','/info/wf/'],async function (req,res) {
  let type = req.params.type || req.query.type
  let key = req.params.key || req.query.key
  res.send(await robotUtils.taskInfo(type,key))
});

router.all('/menuCache',function (req,res) {
  let cache = menuCache.keys().map( key => {
    let value = menuCache.get(key)
    value.bots = value.bots.map( qq => hideQQ(qq) )
    value.users = value.users.map( qq => hideQQ(qq) )
    return value
  })
  res.json(cache)
});
router.all('/requestCache',function (req,res) {
  let cache = requestCache.keys().map( key => {
    let value = requestCache.get(key)
    value.ip = hideIp(value.ip)
    return value
  })
  res.json(cache)
});

function hideQQ(str){
  return str.split('').map((v,i,a) => { return i<3 || a.length-i<3 ? v : '*'}).join('')
}
function hideIp(str){
  return str.replace(/(?<=\.)\d+$/,'*')
}
module.exports = router;
