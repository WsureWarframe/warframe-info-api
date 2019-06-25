var express = require('express');
var router = express.Router();
var hjwiki = require('../utils/huijiwiki');

router.all(['/dev/:type','/dev'],async function (req,res) {
    var bodyType = req.body.type;
    var pathType = req.params.type;
    var type = pathType?pathType:(bodyType?bodyType:null);
    var page = req.body.page ;
    var size = req.body.size ;
    res.send(await hjwiki.getInfo(type,page,size));
});
module.exports = router;
