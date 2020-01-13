const express = require('express');
const router = express.Router();
const hjwiki = require('../utils/huijiwiki');

router.all(['/dev/:type','/dev'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const page = req.body.page;
    const size = req.body.size;
    res.send(await hjwiki.getInfo(type,page,size));
});

router.all(['/detail/:type','/detail'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await hjwiki.getDetail(type));
});

router.all(['/text/:type','/text'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await hjwiki.getHtmlText(type));
});

router.all(['/robot/:type','/robot'],async function (req,res) {
    const bodyType = req.body.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    res.send(await hjwiki.robotFormatStr(type));
});
module.exports = router;
