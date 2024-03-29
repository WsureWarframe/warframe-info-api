const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const retry = require('../utils/retry');
const logger = require('../utils/logger')(__filename)
const rmApi = require('../api/rivenMarket')
const wfaApi = require('../api/wfaRichasy')
const wmApi = require('../api/warframeMarket')
const cacheKey = 'lib';

const scheduleName = '刷新缓存字典'
const cache = new mcache.Cache()
let setWfaLibCache = async () => {
    let start = new Date().getTime();
    let head = `[ScheduleJob] -- ${scheduleName}`
    let dicts = await retry(wfaApi.getWfaLexiconFromGithub,`${head} -- wfa dicts`)
    let wmDicts = await retry(wmApi.auctions,`${head} -- wm dicts`)
    let RivenData = await retry(rmApi.getRivenMarketData, `${head} -- rm RivenData`)
    let mergedLibData = { ...dicts,...wmDicts,RivenData }
    logger.info(`${head} mergedLibData:{${Object.keys(mergedLibData)}} ${new Date().getTime() - start} ms`)
    // save lib to cache
    cache.put(cacheKey, mergedLibData)
    logger.info(`${head} => 结束 ,耗时${new Date().getTime() - start} ms`)
}

let getWfaLibCache = async () => {
    if (!cache.get(cacheKey)) {
        await setWfaLibCache();
    }
    return cache.get(cacheKey)
}


module.exports = {
    scheduleName,
    cache,
    setWfaLibCache,
    getWfaLibCache,
};
