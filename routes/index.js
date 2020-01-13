const express = require('express');
const router = express.Router();
const wfaLib = require('../utils/wfaLibs');
const puppeteerUtil = require('../utils/puppeteerFullShot');
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
