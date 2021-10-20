const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require("moment");
const retry = require('../utils/retry');

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
        const ws = await retry( async () => { return await that.queryWorldState() },
            { times : 3, delay: 3000,onRetry: (data) => {
                    console.log('onRetry',data)
                    console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
                } })
            .finally()
        if(ws.arbitration && ws.arbitration.type){
            ws.arbitration.id = (ws.arbitration.type+ws.arbitration.node).replace(/\s/g,'')
        }
        if(ws.voidTrader && ws.voidTrader.active){
            ws.voidTrader.id += ws.voidTrader.active
        }
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
