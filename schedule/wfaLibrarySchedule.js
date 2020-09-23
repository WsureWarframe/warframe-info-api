const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require("moment");
const { getPageStorage } = require('../utils/puppeteer');
const config = require('../config/myConfig');
const retry = require('../utils/retry');
const utils = require('../utils/utils');

const cacheKey = 'lib';

const wfaLibrarySchedule = {
    scheduleName:'刷新缓存的WFA字典',
    cache:new mcache.Cache(),
    getRivenMarketData:function (){
        const RMHost = 'https://riven.market';
        return new Promise(async (resolve, reject) => {
            utils.getRequest(RMHost + '/list/PC')
                .then( RMRes => {
                    if (RMRes.text !== '') {
                        return  RMRes.text.match(/(?<=src=").+warframeData.+?(?=")/).join();
                    } else {
                        reject()
                    }
                })
                .then( RMDataUrl => { return utils.getRequest(RMHost + RMDataUrl)})
                .then(RMData => {
                    if (RMData.text !== '') {
                        const Module = require('module');
                        const rivenData = new Module("riven-data");
                        rivenData._compile(`${RMData.text}
                             module.exports = { statsData : statsData ,weaponData : weaponData };`, 'riven-data');
                        console.log(`riven-data create success`);
                        resolve(rivenData.exports);
                    } else {
                        reject()
                    }
                })

        });
    },
    //todo 使用闭包完成失败重试
    setWfaLibCache: async function(that){
        let start = new Date().getTime();
        let wfa = await retry( async () => { return await getPageStorage(config.wfaHost); },
            { times : 999, delay: 3000,onRetry: (data) => {
                    console.log('onRetry',data)
                    console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
                } })
            .finally()
        let riven = await retry( async () => { return await getPageStorage(config.wfaRivenHost); },
            { times : 999, delay: 3000,onRetry: (data) => {
                    console.log('onRetry',data)
                    console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
                }
            })
            .finally()
        let rivenWeapon = await retry( async () => { return await that.getRivenMarketData(); },
            { times : 999, delay: 3000,onRetry: (data) => {
                    console.log('onRetry',data)
                    console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
                } })
            .finally()
        Object.assign(wfa.storage,riven.storage);
        Object.assign(wfa.cookies,riven.cookies);
        // Object.keys(wfa.storage).filter( key => wfaLibs.libsArr.includes(key)).forEach( key => {
        //     wfaLibs.commonMcache.put(key,wfa.storage[key])
        // })
        wfa.storage.RivenData = rivenWeapon;
        that.cache.put(cacheKey,wfa.storage)
        console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 结束 ,耗时${new Date().getTime() - start} ms`)
    },
    getWfaLibCache: async function (that){
        let cacheLib = that.cache;
        if(!cacheLib.get(cacheKey)){
            await that.setWfaLibCache(that);
        }
        return cacheLib.get(cacheKey)
    },
}




module.exports = wfaLibrarySchedule;
