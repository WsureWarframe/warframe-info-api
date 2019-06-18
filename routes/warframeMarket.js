var express = require('express');
var router = express.Router();
var wm = require('../utils/warframeMarket');

/**
 *  warframe market 信息相关接口
 *  ps：wm是指http://warframe.market
 */

//获取字典接口
router.all(['/detail/:detail','/detail'],async function (req,res) {
    var bodyDetail = req.body.detail;
    var pathDetail = req.params.detail;
    var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
    var page = req.body.page ;
    var size = req.body.size ;
    res.send(await wm.getInfo(detail,page,size));
});

router.all(['/robot/:detail','/robot'],async function (req,res) {
    var bodyDetail = req.body.detail;
    var pathDetail = req.params.detail;
    var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
    res.send(await wm.robotFormatStr(detail));
});
module.exports = router;
