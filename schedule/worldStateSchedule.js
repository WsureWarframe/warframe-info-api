const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const retry = require('../utils/retry');
const wsApi = require('../api/warframestat')
const logger = require('../utils/logger')(__filename)
const cacheKey = 'ws';

const scheduleName = '刷新缓存的WorldState'
const cache = new mcache.Cache()

let setWorldStateCache = async () => {
    let start = new Date().getTime();
    let head = `[ScheduleJob] -- ${scheduleName}`
    const ws = await retry(wsApi.queryWorldState, head)
    if (ws.arbitration != null && ws.arbitration.type) {
        ws.arbitration.id = (ws.arbitration.type + ws.arbitration.node).replace(/\s/g, '')
    }
    if (ws.voidTrader && ws.voidTrader.active) {
        ws.voidTrader.id += ws.voidTrader.active
    }
    cache.put(cacheKey, ws)
    logger.info(`[ScheduleJob] -- ${scheduleName} => 结束 ,耗时${new Date().getTime() - start} ms`)
}
let getWorldStateCache = async () => {
    let cacheWs = cache;
    if (!cacheWs.get(cacheKey)) {
        await setWorldStateCache();
    }
    return cacheWs.get(cacheKey)
}

module.exports = {
    scheduleName,
    cache,
    setWorldStateCache,
    getWorldStateCache
};
