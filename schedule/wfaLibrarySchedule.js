const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require("moment");
const init = require('../utils/init');
const config = require('../config/myConfig');

const cacheKey = 'lib';

const wfaLibrarySchedule = {
    scheduleName:'刷新缓存的WFA字典',
    cache:new mcache.Cache(),
    //todo 使用闭包完成失败重试
    setWfaLibCache: async function(that){
        let start = new Date().getTime();
        try {
            let wfa = await init.getPageStorage(config.wfaHost);
            let riven = await init.getPageStorage(config.wfaRivenHost);
            Object.assign(wfa.storage,riven.storage);
            Object.assign(wfa.cookies,riven.cookies);
            that.cache.put(cacheKey,wfa.storage)
            console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 结束 ,耗时${new Date().getTime() - start} ms`)
        } catch (error){
            console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
            setTimeout( async () => {
                await that.setWfaLibCache(that)
            },3*60*1000)
        }

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
