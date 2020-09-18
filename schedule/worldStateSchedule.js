const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require("moment");
const retry = require("promise-retry");

const cacheKey = 'ws';

const worldStateSchedule = {
    scheduleName: '刷新缓存的WorldState',
    cache: new mcache.Cache(),
    queryWorldState: function (){
        return new Promise((resolve, reject) => {
            superagent
                .get("https://api.warframestat.us/pc")
                .then( res => {
                    resolve(res.body)
                }).catch( error => reject(error))
        })
    },
    setWorldStateCache: async function (that) {
        let start = new Date().getTime();
        const ws = await that.queryWorldState().catch( e => {
            console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
            setTimeout( async () => {
                await that.setWorldStateCache(that)
            },3*1000)
        })
        that.cache.put(cacheKey,ws)
        console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 结束 ,耗时${new Date().getTime() - start} ms`)
    },
    getWorldStateCache: async (that) => {
        let cacheWs = that.cache;
        if(!cacheWs.get(cacheKey)){
            await that.setWorldStateCache(that);
        }
        return cacheWs.get(cacheKey)
    }
}
module.exports = worldStateSchedule;
