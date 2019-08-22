var express = require('express');
var router = express.Router();
var mpUtils = require('../utils/mp');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login',async function (req,res) {
  // var obj = req;
  var code = req.body.code;
  var platform = req.body.platform;
  await waitForPromise(res,mpUtils.mpLogin(code,platform))
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
