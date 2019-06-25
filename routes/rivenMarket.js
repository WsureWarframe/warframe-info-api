var express = require('express');
var router = express.Router();
var rm = require('../utils/rivenMarket');

/**
 *  riven market 信息相关接口
 *  ps：rm是指http://riven.market
 */

//获取字典接口
router.all(['/dev/:type','/dev'],async function (req,res) {
    var bodyType = req.body.type;
    var pathType = req.params.type;
    var type = pathType?pathType:(bodyType?bodyType:null);
    var page = req.body.page ;
    var size = req.body.size ;
    //warframe market
    res.send(await rm.getInfo(type,page,size));
});

router.all(['/robot/:type','/robot'],async function (req,res) {
    var bodyType = req.body.type;
    var pathType = req.params.type;
    var type = pathType?pathType:(bodyType?bodyType:null);
    //warframe market
    res.send(await rm.robotFormatStr(type));
});
module.exports = router;
