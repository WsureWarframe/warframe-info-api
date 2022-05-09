const express = require('express');
const router = express.Router();
const wm = require('../service/warframe/warframeMarket');
const utils = require('../utils/utils');
const logger = require('../utils/logger')(__filename)
const wmApi = require('../api/warframeMarket')
const fs = require('fs');
const path = require("path");
const moment = require("moment");
const wfa = require("../utils/wfaLibs")

const cacheHeader = 'wm';
const timeout = 60 * 1000;
/**
 *  warframe market 信息相关接口
 *  ps：wm是指http://warframe.market
 */

//获取字典接口
router.all(['/dev/:type','/dev'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const page = req.body.page;
    const size = req.body.size;
    res.send(await wm.getInfo(type,page,size));
});

router.all(['/robot/:type','/robot'],async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    const key = `${cacheHeader}:${type}`;
    if(type !== null){
        let result = await utils.cacheUtil(key, async () => {
            return await wm.robotFormatStr(type)
        }, timeout);
        res.send(result);
    } else {
        res.send(null)
    }

});

const filePath = path.join(__dirname, '../utils/lexicon/wmItems/')
router.all('/lexicon',async function (req,res) {
    const bodyType = req.query.type;
    const pathType = req.params.type;
    const type = pathType ? pathType : (bodyType ? bodyType : null);
    let items = await wmApi.items();
    res.send(await wmApi.items());
});
//
// router.all('/lexiconLoad',async function (req,res) {
//     const bodyType = req.query.type;
//     const pathType = req.params.type;
//     const type = pathType ? pathType : (bodyType ? bodyType : null);
//     logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [load items] - start`)
//     let items = await wmApi.items();
//     await utils.createDirIfNotExist(filePath)
//     logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [load items] - size:${items.length}`)
//     for(let index in items){
//         let itemName = items[index]['url_name']
//         let file = filePath+itemName+'.json'
//         if(!fs.existsSync(file)){
//             logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [load items] - item:${itemName} - start`)
//             let json = await wmApi.item(itemName)
//             await utils.writeJsonFile(file,json)
//             logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [load items] - item:${itemName} - end`)
//             await utils.delay(2000)
//         }
//
//     }
//     logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] [load items] - end`)
//     res.send(await wmApi.items());
// });
//
// router.all('/lexicon/:type',async function (req,res) {
//     const type = req.query.type || req.params.type || req.body.type || null;
//     let json = await wmApi.item(type)
//     logger.info(json)
//     await utils.createDirIfNotExist(filePath)
//     logger.info(filePath)
//     await utils.writeJsonFile(filePath+type+'.json',json)
//     res.send(json);
// });
//
// router.all('/lexiconList',async function (req,res) {
//     const bodyType = req.query.type;
//     const pathType = req.params.type;
//     const type = pathType ? pathType : (bodyType ? bodyType : null);
//     let jsonList = await utils.readFileList(filePath)
//     let resList = []
//     for(let item in jsonList){
//         let file = filePath + jsonList[item]
//         let json = await utils.readJsonFile(file)
//         if(json['items_in_set']){
//             resList = resList.concat(json['items_in_set'])
//         }
//     }
//
//     res.send({ size: resList.length,data :resList});
// });

// router.all('/lexiconFileList',async function (req,res) {
//     let resList = await wfa.wmLexicon.lexiconList()
//     res.send({ size: resList.length,data :resList})
// })

router.all('/auctions',async function (req,res) {
    let text = await wmApi.auctions()
    res.json(text)
})
router.all('/auctionsSearch/:type/:weapon',async function (req,res) {
    const type = req.query.type || req.params.type || req.body.type || null;
    const weapon = req.query.weapon || req.params.weapon || req.body.weapon || null;
    let text = await wmApi.auctionsSearch(type,weapon)
    res.json(text)
})

module.exports = router;
