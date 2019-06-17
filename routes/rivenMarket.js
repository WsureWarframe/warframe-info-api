var express = require('express');
var router = express.Router();
var rm = require('../utils/rivenMarket');

/**
 *  riven market 信息相关接口
 *  ps：rm是指http://riven.market
 */

//获取字典接口
router.all('/libs',async function(req, res) {
    //warframe market
    var test = req.body.test;
    console.log(test);
    res.send(await rm.getInfo(test));
});
module.exports = router;
