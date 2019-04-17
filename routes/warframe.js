var express = require('express');
var request = require('request');
var superagent = require('superagent');
require('superagent-proxy')(superagent);
var http_ = require('http');
var router = express.Router();
var init = require('../utils/init');
var mcache = require('memory-cache');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.all('/libs', function(req, res) {
  init.initToken(function (body) {
    init.initLibs(function (libResult) {
      res.send(libResult);
    })
  },function () {
    res.json({error:"网络不畅"});
  });
});

router.all('/detail/:detail',function (req,res) {
  var bodyDetail = req.body.detail;
  var pathDetail = req.params.detail;
  var detail = pathDetail?pathDetail:(bodyDetail?bodyDetail:null);
  wf(detail,function (body) {
    res.json(body);
  },function () {
    res.json({error:"网络不畅"});
  });
});
router.all('/token',function (req,res) {
  init.initToken(function (body) {
    res.json({token:body});
  },function () {
    res.json({error:"网络不畅"});
  });
});
router.all('/list',function (req,res) {
  wf(null,function (body) {
    var list = Object.keys(body);
    res.send(list);
  },function () {
    res.json({error:"网络不畅"});
  });
});

function wf(param,success,fail){
  var url = 'http://api.warframestat.us/pc'+(param?'/'+param:'');
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
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
      .set('grant_type', 'client_credentials').then(res=>{
        console.log(res);
        success(res.body);
  }).catch(err=>{
    console.log(err);
    fail();
  })
}

module.exports = router;
