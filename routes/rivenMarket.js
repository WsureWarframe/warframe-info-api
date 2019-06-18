var express = require('express');
var router = express.Router();
var rm = require('../utils/rivenMarket');

/**
 *  riven market 信息相关接口
 *  ps：rm是指http://riven.market
 */

//获取字典接口
router.all(['/detail/:detail','/detail'],async function (req,res) {
    var bodyDetail = req.body.detail;
    var pathDetail = req.params.detail;
    var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
    var page = req.body.page ;
    var size = req.body.size ;
    //warframe market
    res.send(await rm.getInfo(detail,page,size));
});

router.all(['/robot/:detail','/robot'],async function (req,res) {
    var bodyDetail = req.body.detail;
    var pathDetail = req.params.detail;
    var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
    //warframe market
    res.send(await rm.robotFormatStr(detail));
});
module.exports = router;
