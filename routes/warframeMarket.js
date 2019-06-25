var express = require('express');
var router = express.Router();
var wm = require('../utils/warframeMarket');

/**
 *  warframe market 信息相关接口
 *  ps：wm是指http://warframe.market
 */

//获取字典接口
router.all(['/dev/:type','/dev'],async function (req,res) {
    var bodyType = req.body.type;
    var pathType = req.params.type;
    var type = pathType?pathType:(bodyType?bodyType:null);
    var page = req.body.page ;
    var size = req.body.size ;
    res.send(await wm.getInfo(type,page,size));
});

router.all(['/robot/:type','/dev'],async function (req,res) {
    var bodyType = req.body.type;
    var pathType = req.params.type;
    var type = pathType?pathType:(bodyType?bodyType:null);
    res.send(await wm.robotFormatStr(type));
});
module.exports = router;
