var express = require('express');
var router = express.Router();
var wfaLib = require('../utils/wfaLibs');
var puppeteerUtil = require('../utils/puppeteerFullShot');
const puppeteer = require('puppeteer');


/* GET home page. */
router.get('/',async function(req, res, next) {
  await puppeteerUtil('绝路');
  res.render('index', { title: 'Express' });
});

router.all('/test', function(req, res, next) {
  wfaLib.initLibsCache();
  res.send(wfaLib.libsArr);
});

module.exports = router;
