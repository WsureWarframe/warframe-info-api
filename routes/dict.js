const express = require('express');
const tran = require("../utils/translate");
const logger = require('../utils/logger')(__filename)
const utils = require('../utils/utils');
const router = express.Router();


router.all(['/tran/dev/:key','/tran/dev/:key/:libs'],function (req,res) {
  const pathKey = utils.getParamFromReq(req,'key',true)
  const pathLibs = utils.getParamFromReq(req,'libs') ;
  const max = utils.getParamFromReq(req,'max') || 10 ;
  const libs = pathLibs ? pathLibs.split(',') : [];
  if(pathKey === '')
    res.send("参数错误");
  else
    res.json(tran.fuzzTran(pathKey,libs,max));
});

router.all(['/tran/robot/:key','/tran/robot/:key/:libs'],function (req,res) {
  const pathKey = utils.getParamFromReq(req,'key',true)
  const pathLibs = utils.getParamFromReq(req,'libs') ;
  const max = utils.getParamFromReq(req,'max') || 10 ;
  const libs = pathLibs ? pathLibs.split(',') : [];
  if(pathKey === '')
    res.send("参数错误");
  else
    res.send(tran.fuzzTranRobot(pathKey,libs,max));
});


module.exports = router;
