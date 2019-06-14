var express = require('express');
var router = express.Router();
var wm = require('../utils/warframeMarket');

/**
 *  warframe market 信息相关接口
 *  ps：wm是指http://warframe.market
 */

//获取字典接口
router.all('/libs',async function(req, res) {
    //warframe market
    var test = req.body.test;
    console.log(test);
    res.send(await wm.getInfo(test));
});


router.all('/robot',async function(req, res) {
    //warframe market
    var test = req.body.test;
    console.log(test);
    res.send(await wm.robotFormatStr(test));
});
module.exports = router;
