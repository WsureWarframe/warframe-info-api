const express = require('express');
const router = express.Router();
const wm = require('../utils/warframeMarket');

/**
 *  warframe market 信息相关接口
 *  ps：wm是指http://warframe.market
 */

//获取字典接口
router.all(['/dev/:type','/dev'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const page = req.body.page;
    const size = req.body.size;
    res.send(await wm.getInfo(type,page,size));
});

router.all(['/robot/:type','/dev'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await wm.robotFormatStr(type));
});
module.exports = router;
