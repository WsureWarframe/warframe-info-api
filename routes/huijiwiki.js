const express = require('express');
const router = express.Router();
const hjwiki = require('../service/warframe/huijiwiki');
const utils = require('../utils/utils');

const cacheHeader = 'wiki';
const timeout = 24 * 60 * 60 * 1000;

router.all(['/dev/:type','/dev'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const page = req.body.page;
    const size = req.body.size;
    res.send(await hjwiki.getInfo(type,page,size));
});

/*
    自2021年2月6日起，废弃
router.all(['/detail/:type','/detail'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await hjwiki.getDetail(type));
});

router.all(['/text/:type','/text'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await hjwiki.getHtmlText(type));
});
*/
router.all(['/robot/:type','/robot'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const key = `${cacheHeader}:${type}`;
    let result = await utils.cacheUtil(key, async () => {
        return await hjwiki.robotFormatStr(type);
    }, timeout);
    res.send(result);
});
module.exports = router;
