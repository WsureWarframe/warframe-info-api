var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/add/:jj',function (req,res) {
  // var obj = req;
  console.log(req.baseUrl);
  console.log(req.body);
  res.set('hahaha','huohuohuo');
  res.json({body:req.body,params:req.params.jj});
});

module.exports = router;
