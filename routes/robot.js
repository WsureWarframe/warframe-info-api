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
