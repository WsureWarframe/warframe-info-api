const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require("moment");
const config = require('../config/myConfig');
const retry = require('../utils/retry');
const utils = require('../utils/utils');

const cacheKey = 'lib';
const wfaStorages = ['Dict','Invasion','Sale','Nightwave']
const wfaRivenStorage = ['Riven']

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
    setWfaLibCache: async function(that){
        let start = new Date().getTime();
        let remoteMap = await that.getWfaLexiconFromGithub()

        remoteMap["RivenData"] = await retry(async () => {
                return await that.getRivenMarketData();
            },
            {
                times: 3, delay: 3000, onRetry: (data) => {
                    console.log('onRetry', data)
                    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 获取失败，等待重试`)
                }
            }).then( res => res)
        that.cache.put(cacheKey,remoteMap)
        console.log( `[${moment().format('YYYY-MM-DD HH:mm:ss')}] -- [ScheduleJob] -- ${that.scheduleName} => 结束 ,耗时${new Date().getTime() - start} ms`)
    },
    async getWfaLexiconFromGithub(){
        let remoteMap = {}
        for (let key of Object.keys(config.lexiconMap)){
            remoteMap[key] = await utils.getRequest(config.wfaLexicon+"WF_"+config.lexiconMap[key])
                .then( res => JSON.parse(res.text))
                .catch( e => require(`../utils/lexicon/${config.lexiconMap[key]}`))
            console.log(`${key} - length :${remoteMap[key].length}`)
        }
        return remoteMap
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
