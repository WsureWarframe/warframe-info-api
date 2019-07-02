var express = require('express');
var router = express.Router();
var wfaLib = require('../utils/wfaLibs');
var puppeteerUtil = require('../utils/puppeteerFullShot');
const puppeteer = require('puppeteer');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.all('/test', function(req, res, next) {
  wfaLib.initLibsCache();
  res.send(wfaLib.libsArr);
});

module.exports = router;
