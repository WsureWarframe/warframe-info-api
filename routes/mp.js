const express = require('express');
const router = express.Router();
const mpUtils = require('../utils/mp');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login',async function (req,res) {
  // const obj = req;
  const code = req.body.code;
  const platform = req.body.platform;
  await waitForPromise(res,mpUtils.mpLogin(code,platform))
});

async function waitForPromise(res,promise){
  let data = {};
  try{
    data = await promise;
    res.json(data);
  } catch (e) {
    res.json(e);
  }
}

module.exports = router;
