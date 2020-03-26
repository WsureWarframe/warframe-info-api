const express = require('express');
const router = express.Router();
const wm = require('../utils/warframeMarket');
const utils = require('../utils/utils');

const cacheHeader = 'wm';
const timeout = 60 * 1000;
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

router.all(['/robot/:type','/robot'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const key = `${cacheHeader}:${type}`;
    let result = await utils.cacheUtil(key, async () => {
        return await wm.robotFormatStr(type)
    }, timeout);
    res.send(result);
});
module.exports = router;
