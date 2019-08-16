var express = require('express');
var router = express.Router();
var wxUtils = require('../utils/wx');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login',async function (req,res) {
  // var obj = req;
  var code = req.body.code;
  await waitForPromise(res,wxUtils.wxLogin(code))
});

async function waitForPromise(res,promise){
  var data = {};
  try{
    data = await promise;
    res.json(data);
  } catch (e) {
    res.json(e);
  }
}

module.exports = router;
