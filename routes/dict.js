const express = require('express');
const tran = require("../utils/translate");
const router = express.Router();


router.all(['/tran/dev/:key','/tran/dev/:key/:libs'],function (req,res) {
  const pathKey = req.param('key',null);
  const pathLibs = req.param('libs') ;
  const max = parseInt(req.param('max',10)) ;
  const libs = pathLibs ? pathLibs.split(',') : [];
  if(pathKey === '')
    res.send("参数错误");
  else
    res.json(tran.fuzzTran(pathKey,libs,max));
});

router.all(['/tran/robot/:key','/tran/robot/:key/:libs'],function (req,res) {
  const pathKey = req.param('key',null);
  const pathLibs = req.param('libs') ;
  const max = parseInt(req.param('max',10)) ;
  console.log('max:'+max)
  const libs = pathLibs ? pathLibs.split(',') : [];
  if(pathKey === '')
    res.send("参数错误");
  else
    res.send(tran.fuzzTranRobot(pathKey,libs,max));
});


module.exports = router;
