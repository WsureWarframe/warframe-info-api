const express = require('express');
const router = require('express-promise-router')();
const wma = require('../service/warframe/warframeMarketAuctions');
const utils = require('../utils/utils');
const logger = require('../utils/logger')(__filename)
const wmApi = require('../api/warframeMarket')
const path = require("path");
const moment = require("moment");
const wfa = require("../utils/wfaLibs")

const cacheHeader = 'wm';
const timeout = 60 * 1000;


router.all(['/auctionsSearch/:type/:weapon','/auctionsSearch/:type','/auctionsSearch'],async function (req,res) {
    const type = utils.getParamFromReq(req,'type') 
    const weapon = utils.getParamFromReq(req,'weapon',true) 
    let text = await wmApi.auctionsSearch(type,weapon)
    res.json(text)
})

router.all(['/dev/:type','/dev'],async function (req,res) {
    const type = utils.getParamFromReq(req,'type',true)
    const page = utils.getParamFromReq(req,'page')
    const size = utils.getParamFromReq(req,'size')
    const baseType = req.baseUrl == '/wmr' ? "riven" : "weapon"
    res.send(await wma.getInfo(type,baseType,page,size));
});

router.all(['/robot/:type','/robot'],async function (req,res) {
    const baseType = req.baseUrl == '/wmr' ? "riven" : "weapon"
    const type = utils.getParamFromReq(req,'type',true)
    const key = `${cacheHeader}:${type}`;
    if(type !== null){
        let result = await utils.cacheUtil(key, async () => {
            return await wma.robotFormatStr(type,baseType)
        }, timeout);
        res.send(result);
    } else {
        res.send(null)
    }
});

module.exports = router;