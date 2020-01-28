const express = require('express');
const WorldState = require('warframe-worldstate-parser');
const rp = require('request-promise');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const propxyConfig = require('../config/proxyConfig');
const router = express.Router();
const wfaLibs = require('../utils/wfaLibs');
const utils = require('../utils/utils');
const warframeUtil = require('../utils/warframe');
const tran = require('../utils/translate');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/**
 *  wfa 信息相关接口
 *  ps：wfa是指http://wfa.richasy.cn
 */

//获取字典接口
router.all('/libs', function(req, res) {
  //获取 wfa Token
  wfaLibs.initToken(function (body) {
    //获取拿到Token后请求 wfa lib字典
    wfaLibs.initLibs(function (libResult) {
      //将回调返回的结果输出
      res.send(libResult);
    })
  },function () {
    //error
    res.json({error:"网络不畅",message:"获取wfa Token失败！"});
  });
});

//单独获取 Token
router.all('/token',function (req,res) {
  wfaLibs.initToken(function (body) {
    res.json({token:body});
  },function () {
    res.json({error:"网络不畅",message:"获取wfa Token失败！"});
  });
});

/**
 * api信息接口
 * ps：来源：http://api.warframestat.us/
 */

//获取分类
router.all('/list',function (req,res) {
  wfApi(null,function (body) {
    const list = Object.keys(body);
    res.send(list);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all(['/detail/:detail','/detail'],function (req,res) {
  const bodyDetail = req.body.detail;
  const pathDetail = req.params.detail;
  const detail = pathDetail ? pathDetail : (bodyDetail ? bodyDetail : null);
  wfApi(detail,function (body) {
    res.json(body);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/keys',function (req,res) {
  const mcache = wfaLibs.mcache;
  res.send(mcache.keys());
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
  wfApi('events',function (body) {
    const time = utils.apiTimeUtil(body[0].expiry);
    res.json(time);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all(['/dev/:type','/dev'],function (req,res) {
  const bodyType = req.body.type;
  const pathType = req.params.type;
  const type = pathType ? pathType : (bodyType ? bodyType : null);
  console.log(type);
  wfApi(type,function (body) {
    const data = warframeUtil.getInfo(type, body);
    if (data instanceof Promise) {
      data.then(result=>{
        res.json(result);
      }).catch(err=>{
        res.json(err);
      })
    } else {
      res.json(data);
    }
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all(['/robot/:type','/robot'],function (req,res) {
  const bodyType = req.body.type;
  const pathType = req.params.type;
  const type = pathType ? pathType : (bodyType ? bodyType : null);
  const param = utils.testType(type);
  wfApi(param,function (body) {
    const data = warframeUtil.robotFormatStr(type, body);
    if (data instanceof Promise) {
      data.then(result=>{
        // res.json({type:type,context:result});
        res.send(result);
      }).catch(err=>{
        res.json({type:type,err:err});
      })
    } else {
      // res.json({type:type,context:data});
      res.send(data);
    }
  },function () {
    res.send("500：服务器内部错误，参数："+type);
  });
});

function wfApi(param,success,fail){
  /*
  superagent
      .get(url)
      .proxy(propxyConfig.proxy)
      .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
      .then(res=>{
        if(res.body.error)
        {
          fail();
          return;
        }
        console.log("wfApi body",res.body);
        success(res.body);
      }).catch(err=>{
    console.log(err);
    fail();
  });
  */
  rp('http://content.warframe.com/dynamic/worldState.php')
      .then(res=>{
        console.log("wfApi request success:",param);
        const ws = new WorldState(res);
        if(param) {
          success(ws[param]);
        } else {
          success(ws)
        }
      }).catch( err => {
        fail(err);
  })
}
module.exports = router;
