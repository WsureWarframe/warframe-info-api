const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const retry = require('../utils/retry');
const logger = require('../utils/logger')(__filename)
const rmApi = require('../api/rivenMarket')
const wfaApi = require('../api/wfaRichasy')
const cacheKey = 'lib';

const scheduleName = '刷新缓存的WFA字典'
const cache = new mcache.Cache()
let setWfaLibCache = async () => {
    let start = new Date().getTime();
    let remoteMap = await wfaApi.getWfaLexiconFromGithub()
    let head = `[ScheduleJob] -- ${scheduleName}`
    remoteMap["RivenData"] = await retry(rmApi.getRivenMarketData, head)
    cache.put(cacheKey, remoteMap)
    logger.info(`${head} => 结束 ,耗时${new Date().getTime() - start} ms`)
}

let getWfaLibCache = async () => {
    let cacheLib = cache;
    if (!cacheLib.get(cacheKey)) {
        await setWfaLibCache();
    }
    return cacheLib.get(cacheKey)
}


module.exports = {
    scheduleName,
    cache,
    setWfaLibCache,
    getWfaLibCache,
};
