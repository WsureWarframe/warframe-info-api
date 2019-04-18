var express = require('express');
var request = require('request');
var superagent = require('superagent');
require('superagent-proxy')(superagent);
var router = express.Router();
var wfaLibs = require('../utils/wfaLibs');
var utils = require('../utils/utils');
var mcache = require('memory-cache');
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

router.all('/time',function (req,res) {
  wfApi('timestamp',function (body) {
    var time = utils.apiTimeUtil(body);
    res.json(time);
  },function () {
    res.json({error:"网络不畅"});
  });
});

function wfApi(param,success,fail){
  var url = 'http://api.warframestat.us/pc'+(param?'/'+param:'');
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log("wfApi body",body);
      var data = JSON.parse(body);
      success(data);
    } else {
      fail();
    }
  });
}

var proxy = 'http://127.0.0.1:8888';
function access_token(success,fail){
  var url =  'http://api.richasy.cn/connect/token';
  var params = 'client_id=eadfa670ed114c7dbcaecb1a3a1f5fac&client_secret=2bdaaf0e90bd4e8784788d86eb8bca12&grant_type=client_credentials';
  var reqData = {
    'client_id': 'eadfa670ed114c7dbcaecb1a3a1f5fac',
    'client_secret': '2bdaaf0e90bd4e8784788d86eb8bca12',
    'grant_type': 'client_credentials'
  };
  var headers= {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
      'Referer': 'http://wfa.richasy.cn/'
    };
  superagent
      .post(url)
      .proxy(proxy)
      .send(params)
      .set('client_id','eadfa670ed114c7dbcaecb1a3a1f5fac')
      .set('client_secret', '2bdaaf0e90bd4e8784788d86eb8bca12')
      .set('grant_type', 'client_credentials')
      .then(res=>{
        console.log(res);
        success(res.body);
  }).catch(err=>{
    console.log(err);
    fail();
  })
}

module.exports = router;
