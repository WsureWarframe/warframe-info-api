const superagent = require('superagent');
require('superagent-proxy')(superagent);
const path = require('path');
const fs = require('fs');
const schedule = require("node-schedule");
const wsSchedule = require('../schedule/worldStateSchedule');
const libSchedule = require('../schedule/wfaLibrarySchedule');
const wfaLib = require('../utils/wfaLibs');
const logger = require('../utils/logger')(__filename)
const config = require('../config/myConfig');

const endpointFile = path.join(__dirname,  '../config'); //保存至目录下的file文件夹
const screenshotDir = path.join(__dirname, '../public/screenshot') ;

const init = {
    onstart :async function (){

        //Schedule
        schedule.scheduleJob('0 0/3 * * * ?' , function (){
            wsSchedule.setWorldStateCache().finally()
        });

        libSchedule.getWfaLibCache()
            .then(res => logger.info(Object.keys(res)))
            .then(() => wfaLib.initOnlineRW())
            .then(() => wfaLib.initOnlineLib())
            .then(() => wfaLib.initLibsCache());

        schedule.scheduleJob('0 0 0/2 * * ?' , function (){
            libSchedule.setWfaLibCache()
                .then(() => libSchedule.getWfaLibCache())
                .then(res => logger.info(Object.keys(res)))
                .then(() => wfaLib.initOnlineRW())
                .then(() => wfaLib.initOnlineLib())
                .then(() => wfaLib.initLibsCache());
        });
    }

};

module.exports = init;
