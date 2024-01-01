const mcache = require('memory-cache');
const statsName = require('./dict/RivenStatsName.json');
const wfaLibrarySchedule = require('../schedule/wfaLibrarySchedule');
const customDict = require('./dict/custom.json');
const path = require("path");
const lexiconPath = path.join(__dirname, './lexicon/wmItems/')
const logger = require('./logger')(__filename)
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
    wmRiven: new mcache.Cache(),

    auctionsWeapons: new mcache.Cache(),
    ephemeras: new mcache.Cache(),
    quirks: new mcache.Cache(),
};
const libsArr = ['Dict', 'Sale', 'Riven', 'NightWave', 'Invasion']
const commonMcache = new mcache.Cache()
/* GET users listing. */

let initRWCache = (rivenData) => {
    Object.keys(rivenData.weaponData).forEach(type =>{
        Object.keys(rivenData.weaponData[type]).forEach(weapon=>{
            libs.rw.put(weapon.replace(/_/g,' '),rivenData.weaponData[type][weapon]);
        })
    });
    logger.info("rw:"+ libs.rw.size());
    Object.keys(rivenData.statsData).forEach(stats =>{
        let word = rivenData.statsData[stats];
        word.Name = statsName[stats] ? statsName[stats] : stats;
        libs.rd.put(stats,word);
    });
    logger.info("rd:"+ libs.rd.size());
}
let initLibsCache = () => {
    libsArr.forEach(function (value, index, array) {
        logger.info(value);
        let lib = commonMcache.get(value)
        lib.forEach(function (value_, index_) {
            libs[value].put(value_.en, value_);
        })
    });

    // wm
    commonMcache.get('items').forEach((value_, index_) => {
        libs['wm'].put(value_.en, value_);
        value_.en !== value_.zh && libs['wm'].put(value_.zh, value_);
    });

    // riven
    commonMcache.get('riven_items').forEach((value_, index_) => {
        libs.wmRiven.put(value_.en,value_)
        value_.en !== value_.zh && libs.wmRiven.put(value_.zh, value_);
        if(libs['rw'].get(value_.en)){
            libs['rm'].put(value_.en, value_);
            value_.en !== value_.zh && libs['rm'].put(value_.zh, value_);
            libs.rw.del(value_.en);
        }
    })

    //加载黑话
    initCustomLib()

    logger.info("rw :"+libs.rw.size()+" rm: "+libs.rm.size())
    logger.info(libs.rw.keys().join(','))
}
let initOnlineLib = async () => {
    let library = await wfaLibrarySchedule.getWfaLibCache();
    Object.keys(library).forEach((value => {
        commonMcache.put(value, library[value])
    }))
}
let initOnlineRW = async () => {
    let library = await wfaLibrarySchedule.getWfaLibCache();
    initRWCache(library['RivenData']);

}
let initCustomLib = () => {
    let sale = commonMcache.get('items')
    let customSale = customDict.map(
        da => sale.filter( db => db.en.toUpperCase().includes(da.en.toUpperCase()) )
            .map( db => { return { ...db,customZh: db.zh.toUpperCase().replace(da.en,da.zh),custom:da.zh}})
    ).flatMap(v => v)
    commonMcache.put('custom',customSale)
    customSale.forEach(value_ => {
        libs['wm'].put(value_.customZh, value_);
    })
}

let lexiconLoad = async () => {
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
}
let lexiconList = async () => {
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
}
let distinct = (arr,apply) => {
    return arr.filter( (v,i,a) => a.map(item => apply(item)).indexOf(apply(v)) === i)
}

module.exports = {
    libs,
    commonMcache,
    initRWCache,
    initLibsCache,
    initOnlineLib,
    initOnlineRW,
    lexiconLoad,
    lexiconList
};
