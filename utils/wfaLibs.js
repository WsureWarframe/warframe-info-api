const mcache = require('memory-cache');
const statsName = require('./dict/RivenStatsName.json');
const wfaLibrarySchedule = require('../schedule/wfaLibrarySchedule');
const customDict = require('./dict/custom.json');
const path = require("path");
const lexiconPath = path.join(__dirname, './lexicon/wmItems/')
const logger = require('./logger')(__filename)
const moment = require("moment");
const wmApi = require("../api/warframeMarket");
const utils = require("../utils/utils");
const fs = require("fs");

const libs = {
    Dict: new mcache.Cache(),
    Sale: new mcache.Cache(),
    Riven: new mcache.Cache(),
    NightWave: new mcache.Cache(),
    Invasion: new mcache.Cache(),

    wm: new mcache.Cache(),
    rm: new mcache.Cache(),
    /* riven weapon */
    rw: new mcache.Cache(),
    /* riven dict (stats)*/
    rd: new mcache.Cache(),
    /* warframe market lexicon */
    wml: new mcache.Cache()
};
/* GET users listing. */
const wfaLibs = {
    commonMcache: new mcache.Cache(),
    libs: libs,
    libsArr: ['Dict', 'Sale', 'Riven', 'NightWave', 'Invasion'],
    initRWCache(that,rivenData){
        Object.keys(rivenData.weaponData).forEach(type =>{
            Object.keys(rivenData.weaponData[type]).forEach(weapon=>{
                that.libs.rw.put(weapon.replace(/_/g,' '),rivenData.weaponData[type][weapon]);
            })
        });
        logger.info("rw:"+ that.libs.rw.size());
        Object.keys(rivenData.statsData).forEach(stats =>{
            let word = rivenData.statsData[stats];
            word.Name = statsName[stats] ? statsName[stats] : stats;
            that.libs.rd.put(stats,word);
        });
        logger.info("rd:"+ that.libs.rd.size());
    },
    initLibsCache(that) {
        that.libsArr.forEach(function (value, index, array) {
            logger.info(value);
            // that.libs[value].put(value,index);
            // logger.info(value,that.libs[value].get(value))
            if (value === 'Sale') {
                that.commonMcache.get(value).forEach(function (value_, index_) {
                    that.libs['wm'].put(value_.en, value_);
                    value_.en !== value_.zh && that.libs['wm'].put(value_.zh, value_);
                });
            }

            /*
                紫卡
            if(value === 'Riven'){
                that.commonMcache.get(value).filter(item=> that.libs['rw'].get(item.en)!=null ).forEach(function (value_, index_) {
                    that.libs['rm'].put(value_.en, value_);
                    value_.en !== value_.zh && that.libs['rm'].put(value_.zh, value_);
                    that.libs.rw.del(value_.en);
                });
            }
            */

            let lib = that.commonMcache.get(value)
            lib.forEach(function (value_, index_) {

                that.libs[value].put(value_.en, value_);
                /**
                 * 判断是不是riven market的紫卡
                 * **/
                if(that.libs['rw'].get(value_.en)){
                    that.libs['rm'].put(value_.en, value_);
                    value_.en !== value_.zh && that.libs['rm'].put(value_.zh, value_);
                    that.libs.rw.del(value_.en);
                }
            })
        });

        //加载黑话
        that.initCustomLib(that)

        logger.info("rw :"+that.libs.rw.size()+" rm: "+that.libs.rm.size())
        logger.info(that.libs.rw.keys().join(','))
    },
    initOnlineLib: async (that) => {
        let library = await wfaLibrarySchedule.getWfaLibCache();
        that.libsArr.forEach(function (value) {
            that.commonMcache.put(value, library[value])
        })
    },
    initOnlineRW:async (that) => {
        let library = await wfaLibrarySchedule.getWfaLibCache();
        that.initRWCache(that,library['RivenData']);

    },
    initCustomLib:function (that){
        let sale = that.commonMcache.get('Sale')
        let customSale = customDict.map(
            da => sale.filter( db => db.main.toUpperCase() === da.en.toUpperCase() )
                .map( db => { return { ...db,customZh: db.main === db.en ? da.zh : db.zh.toUpperCase().replace(da.en,da.zh),custom:da.zh}})
        ).flatMap(v => v)
        that.commonMcache.put('custom',customSale)
        customSale.forEach(value_ => {
            that.libs['wm'].put(value_.customZh, value_);
        })
    },
    wmLexicon:{
        lexiconLoad:async function (){
            logger.info(`[load items] - start`)
            let items = await wmApi.items();
            await utils.createDirIfNotExist(lexiconPath)
            logger.info(`[load items] - size:${items.length}`)
            for(let index in items){
                let itemName = items[index]['url_name']
                let file = lexiconPath+itemName+'.json'
                if(!fs.existsSync(file)){
                    try{
                        logger.info(`[load items] - item:${itemName} - start`)
                        let json = await wmApi.item(itemName)
                        await utils.writeJsonFile(file,json)
                    }catch (e){
                        logger.error(`[load items] - item:${itemName} - Error! ${e}`)
                    }finally {
                        logger.info(`[load items] - item:${itemName} - end`)
                        await utils.delay(2000)
                    }
                }
            }
            logger.info(`[load items] - end`)
        },
        lexiconList:async function(){
            await utils.createDirIfNotExist(lexiconPath)
            let jsonList = await utils.readFileList(lexiconPath)
            let resList = []
            for(let item in jsonList){
                let file = lexiconPath + jsonList[item]
                try{
                    let json = await utils.readJsonFile(file)
                    if(json['items_in_set']){
                        resList = resList.concat(json['items_in_set'])
                    }
                }catch (e){
                    logger.error(`[read items] - item:${jsonList[item]} - Error! ${e}`)
                }
            }
            return distinct(resList,v => v['url_name'])
        },
    }
};

let distinct = (arr,apply) => {
    return arr.filter( (v,i,a) => a.map(item => apply(item)).indexOf(apply(v)) === i)
}

module.exports = wfaLibs;
