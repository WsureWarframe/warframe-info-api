const superagent = require('superagent');
require('superagent-proxy')(superagent);
const path = require('path');
const fs = require('fs');
const schedule = require("node-schedule");
const wsSchedule = require('../schedule/worldStateSchedule');
const libSchedule = require('../schedule/wfaLibrarySchedule');
const wfaLib = require('./wfaLibs');
const config = require('../config/myConfig');

const endpointFile = path.join(__dirname,  '../config'); //保存至目录下的file文件夹
const screenshotDir = path.join(__dirname, '../public/screenshot') ;

const init = {
    onstart :async function (){

        //Schedule
        schedule.scheduleJob('0 0/3 * * * ?' , function (){
            wsSchedule.setWorldStateCache(wsSchedule).finally()
        });

        libSchedule.getWfaLibCache(libSchedule)
            .then(res => console.log(Object.keys(res)))
            .then(() => wfaLib.initOnlineRW(wfaLib))
            .then(() => wfaLib.initOnlineLib(wfaLib))
            .then(() => wfaLib.initLibsCache(wfaLib));

        schedule.scheduleJob('0 0 0/2 * * ?' , function (){
            libSchedule.setWfaLibCache(libSchedule)
                .then(() => libSchedule.getWfaLibCache(libSchedule))
                .then(res => console.log(Object.keys(res)))
                .then(() => wfaLib.initOnlineRW(wfaLib))
                .then(() => wfaLib.initOnlineLib(wfaLib))
                .then(() => wfaLib.initLibsCache(wfaLib));
        });
    },
    saveEndpoint: function(endpointInfo) {
        return new Promise( async (resolve, reject) => {
            /* 如果文件夹不存在则创建 */
            try {
                await createDirIfNotExist(endpointFile);
                fs.writeFileSync(endpointFile + '/endpoint', endpointInfo)
                resolve()
            }catch ( err ){
                reject(err)
            }
        })
    },
    readEndpoint: function ()  {
        return new Promise( async (resolve, reject) => {
            /* 如果文件夹不存在则创建 */
            try {
                await createDirIfNotExist(endpointFile);
                let text = fs.readFileSync(endpointFile + '/endpoint').toString();
                resolve(text)
            } catch (err){
                reject(err)
            }
        })
    }

};

function createDirIfNotExist(dir){
    return new Promise( (resolve, reject) => {
        const exists = fs.existsSync(dir);
        if(!exists){
            fs.mkdir(dir, function(err) {
                if (err) {
                    reject(err);
                } else {
                    console.log(`目录创建${dir}成功。`);
                    resolve()
                }
            });
        } else {
            resolve()
        }
    })
}

module.exports = init;
