var express = require('express');
var request = require('request');
var superagent = require('superagent');
require('superagent-proxy')(superagent);
var propxyConfig = require('../config/proxyConfig');
var router = express.Router();
var wfaLibs = require('../utils/wfaLibs');
var utils = require('../utils/utils');
var warframeUtil = require('../utils/warframe');
var tran = require('../utils/translate');
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
    var list = Object.keys(body);
    res.send(list);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/detail/:detail',function (req,res) {
  var bodyDetail = req.body.detail;
  var pathDetail = req.params.detail;
  var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
  wfApi(detail,function (body) {
    res.json(body);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/keys',function (req,res) {
  var mcache = wfaLibs.mcache;
  res.send(mcache.keys());
});

router.all('/test',function (req, res) {
  var test = req.body.str;
  res.send(tran.translateByCache(test));
});

router.all('/tran',async function (req, res) {
  var test = req.body.str;
  var lan = req.body.lan;
  res.send(await tran.googleTranslate(test, lan))
});

router.all('/time',function (req,res) {
  wfApi('events',function (body) {
    var time = utils.apiTimeUtil(body[0].expiry);
    res.json(time);
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/dev/:type',function (req,res) {
  var type = req.params.type;
  console.log(type);
  wfApi(type,function (body) {
    var data = warframeUtil.getInfo(type,body);
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

router.all('/robot/:type',function (req,res) {
    var type = req.params.type;
  var param = utils.testType(req.params.type);
  console.log(type);
  wfApi(param,function (body) {
    var data = warframeUtil.robotFormatStr(type,body);
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
    res.json({error:"网络不畅"});
  });
});

function wfApi(param,success,fail){
  var url = 'http://api.warframestat.us/pc'+(param?'/'+param:'');
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
}
module.exports = router;
