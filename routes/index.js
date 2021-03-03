const express = require('express');
const router = express.Router();
const wfaLib = require('../utils/wfaLibs');
const wfaSchedule = require('../schedule/wfaLibrarySchedule');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'warframe-info-api' });
});

router.all('/keys/:type/',function (req,res) {
  const pathType = req.params.type;
  if( !pathType )
    res.send("参数错误");
  else{
    wfaSchedule.getWfaLibCache(wfaSchedule).then( data => {
      res.json(data[pathType]);
    }).catch(error => {
      res.json({error:error})
    })
  }

});


module.exports = router;
