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
    onstart :function (){

        //初始化截图目录
        this.initScreenshotDir()

        //Schedule
        schedule.scheduleJob('0 0/3 * * * ?' , function (){
            wsSchedule.setWorldStateCache(wsSchedule).finally()
        });
        schedule.scheduleJob('0 0 0/2 * * ?' , function (){
            libSchedule.setWfaLibCache(libSchedule).finally()
        });

        //init data
        if(config.localLib){
            wfaLib.initLocalRW(wfaLib);
            wfaLib.initLocalLib(wfaLib);
            wfaLib.initLibsCache(wfaLib);
        } else {
            libSchedule.getWfaLibCache(libSchedule).then(res => {
                console.log(Object.keys(res));
                wfaLib.initOnlineRW(wfaLib)
                    .then(() => wfaLib.initOnlineLib(wfaLib))
                    .finally(() => wfaLib.initLibsCache(wfaLib));
            })
        }
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
    },
    initScreenshotDir: () => {

        const exists = fs.existsSync(screenshotDir)
        console.log(` ScreenshotDir is ${exists ? '' : 'not'} exists`);
        if(!exists){
            fs.mkdir( screenshotDir ,{recursive: true}, (err) => {
                if(!err){
                    console.log(" mkdir ScreenshotDir success!")
                } else {
                    console.error(" mkdir ScreenshotDir fail!")
                    console.log(err)
                }

            })
        }
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
