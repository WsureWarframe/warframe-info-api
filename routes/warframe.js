const express = require('express');
// const WorldState = require('warframe-worldstate-parser');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const proxyConfig = require('../config/proxyConfig');
const router = express.Router();
const wfaLibs = require('../utils/wfaLibs');
const utils = require('../utils/utils');
const logger = require('../utils/logger')(__filename)
const warframeUtil = require('../service/warframe/warframe');
const tran = require('../utils/translate');
const schedule = require('../schedule/worldStateSchedule');
const initUtils = require('../service/init')

const cacheHeader = 'rm';
const timeout = 2 * 60 * 1000;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//获取分类
router.all('/list',function (req,res) {
  wfApi(null).then( body => {
    logger.info(body)
    const list = Object.keys(body);
    res.send(list);
  }).catch(e => {
    console.error(e)
    res.json({error:"网络不畅"});
  });
});

router.all(['/detail/:detail','/detail'],function (req,res) {
  const bodyDetail = req.body.detail;
  const pathDetail = req.params.detail;
  const detail = pathDetail ? pathDetail : (bodyDetail ? bodyDetail : null);
  wfApi(detail).then( body => {
    res.json(body);
  }).catch(e => {
    console.error(e)
    res.json({error:"网络不畅"});
  });
});

router.all('/keys/:type/:key',function (req,res) {
  const pathType = req.params.type;
  const pathKey = req.params.key;
  if(pathKey === '' || pathType === '')
    res.send("参数错误");
  else
    res.json(wfaLibs.libs[pathType].get(pathKey));
});

router.all('/test',function (req, res) {
  const test = req.body.str;
  res.send(tran.translateByCache(test));
});

router.all('/tran',async function (req, res) {
  const test = req.body.str;
  const lan = req.body.lan;
  res.send(await tran.googleTranslate(test, lan))
});

router.all('/time',function (req,res) {
  wfApi('events').then(body => {
    const time = utils.apiTimeUtil(body[0].expiry);
    res.json(time);
  }).catch(e => {
    console.error(e)
    res.json({error:"网络不畅"});
  });
});

router.all(['/dev/:type','/dev'],function (req,res) {
  const bodyType = req.query.type;
  const pathType = req.params.type;
  const type = pathType ? pathType : (bodyType ? bodyType : null);
  logger.info(type);
  wfApi(type).then(body => {
    const data = warframeUtil.getInfo(type, body);
    if (data instanceof Promise) {
      data.then(result => {
        res.json(result);
      }).catch(err => {
        res.json(err);
      })
    } else {
      res.json(data);
    }
  }).catch( e => {
    console.error(e)
    res.json({error: "网络不畅"});
  })
});

router.all(['/robot/:type','/robot'],async function (req,res) {
  const bodyType = req.query.type;
  const pathType = req.params.type;
  const type = pathType ? pathType : (bodyType ? bodyType : null);
  const param = utils.testType(type);
  const key = `${cacheHeader}:${type}`;
  let body =  await wfApi(param)
  let result = await warframeUtil.robotFormatStr(type, body);
  res.send(result);
});

let wfApi = (param) => new Promise(async (resolve, reject) => {
  /*
  //不用这玩意了，拿不到仲裁，还慢
  rp('http://content.warframe.com/dynamic/worldState.php')
      .then(res=>{
        logger.info("wfApi request success:",param);
        const ws = new WorldState(res);
        if(param) {
          resolve(ws[param]);
        } else {
          resolve(ws)
        }
      }).catch( err => {
        logger.info(err);
    reject(err);
  })
  */

  let worldState = await schedule.getWorldStateCache(schedule);
  resolve(param ? worldState[param] : worldState)
});
module.exports = router;
