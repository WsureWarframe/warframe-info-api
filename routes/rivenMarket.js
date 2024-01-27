const express = require('express');
const router = express.Router();
const rm = require('../service/warframe/rivenMarket');
const utils = require('../utils/utils');

const cacheHeader = 'rm';
const timeout = 60 * 1000;

/**
 *  riven market 信息相关接口
 *  ps：rm是指http://riven.market
 */

//获取字典接口
router.all(['/dev/:type','/dev'],async function (req,res) {
    const type = utils.getParamFromReq(req,'type',true)
    const page = utils.getParamFromReq(req,'page')
    const size = utils.getParamFromReq(req,'size')
    //warframe market
    res.send(await rm.getInfo(type,page,size));
});

router.all(['/robot/:type','/robot'],async function (req,res) {
    const type = utils.getParamFromReq(req,'type',true)
    //warframe market
    const key = `${cacheHeader}:${type}`;
    let result = await utils.cacheUtil(key, async () => {
        return await rm.robotFormatStr(type);
    }, timeout);
    res.send(result);
});
module.exports = router;
