const mcache = require('memory-cache');
const statsName = require('./dict/RivenStatsName.json');
const WmRivenAttribute = require('./dict/WmRivenAttribute.json');
const wfaLibrarySchedule = require('../schedule/wfaLibrarySchedule');
const customDict = require('./dict/custom.json');
const path = require("path");
const lexiconPath = path.join(__dirname, './lexicon/wmItems/')
const logger = require('./logger')(__filename)
const wmApi = require("../api/warframeMarket");
const utils = require("../utils/utils");
const fs = require("fs");

// 存放经过处理的特定业务的词库
const libs = {
    // WFA的遗产词库，Dict为比较全面的词库（旧
    Dict: new mcache.Cache(),       //Dict为比较全面的词库（旧
    Sale: new mcache.Cache(),       //对应wm的items，不过比较旧已经废弃
    Riven: new mcache.Cache(),      //废弃，被wm的riven_items替代
    NightWave: new mcache.Cache(),  //午夜电波,可能还在使用
    Invasion: new mcache.Cache(),   //入侵、裂隙、奸商相关

    wm: new mcache.Cache(),
    rm: new mcache.Cache(),
    /* riven weapon */
    rw: new mcache.Cache(),
    /* riven dict (stats)*/
    rd: new mcache.Cache(),
    /* warframe market lexicon */
    wmRiven: new mcache.Cache(),
    riven_attributes: new mcache.Cache(),
    auctionsWeapons: new mcache.Cache(),
    ephemeras: new mcache.Cache(),
    quirks: new mcache.Cache(),

    wmr2rma: new mcache.Cache(),
};
const libsArr = ['Dict', 'Sale', 'Riven', 'NightWave', 'Invasion']
const wmLibArr = [ 'riven_attributes','auctionsWeapons','ephemeras','quirks']
const wmLibURLArr = [ 'ephemeras','quirks']
// 内容对应：
//      WFA遗产：Dict,Invasion,NightWave,Lib,Sale,Riven.    
//      WarframeMarket: items(常规商品),riven_items(紫卡武器),riven_attributes(紫卡属性),auctionsWeapons(玄骸+姐妹武器),ephemeras,quirks.           
//      RivenMarket: RivenData
const commonMcache = new mcache.Cache()

let initLibsCache = async () => {
    // Setp 0:
    //  从schedule cache获取最新词库
    let library = await wfaLibrarySchedule.getWfaLibCache();
    //  刷新到commonMcache
    Object.keys(library).forEach((value => {
        commonMcache.put(value, library[value])
    }))

    // Setp 1: 
    //  init RivenMarket Dict
    rivenData = commonMcache.get('RivenData');
    // 遍历所有type,展开所有weapon, put到`libs.rw`
    Object.keys(rivenData.weaponData).forEach(type =>{
        Object.keys(rivenData.weaponData[type]).forEach(weapon=>{
            libs.rw.put(weapon.replace(/_/g,' '),rivenData.weaponData[type][weapon]);
        })
    });
    logger.info("rw:"+ libs.rw.size());
    // 遍历所有词条, put到`libs.rd`
    Object.keys(rivenData.statsData).forEach(stats =>{
        let word = rivenData.statsData[stats];
        word.Name = statsName[stats] ? statsName[stats] : stats;
        libs.rd.put(stats,word);
    });
    logger.info("rd:"+ libs.rd.size());

    // wfa static Dict
    libsArr.forEach(function (value, index, array) {
        logger.info(value);
        let lib = commonMcache.get(value)
        lib.forEach(function (value_, index_) {
            libs[value].put(value_.en, value_);
        })
    });

    // wmr2rma()
    wmr2rma()

    // wm 常规物品的数据创建
    commonMcache.get('items').forEach((value_, index_) => {
        libs['wm'].put(value_.en, value_);
        value_.en !== value_.zh && libs['wm'].put(value_.zh, value_);
    });
    commonMcache.get('riven_attributes').forEach(v => {
        rm_name = commonMcache.get('wmr2rma')[v.url_name]
        libs.riven_attributes.put(v.url_name,{...v,rm_name})
    })
    commonMcache.get('ephemeras').forEach(v => {
        libs.ephemeras.put(v.element,v)
    })
    wmLibArr.forEach( libName => {
        commonMcache.get(libName).forEach((value_, index_) => {
            libs[libName].put(value_.en, value_);
            value_.en !== value_.zh && libs[libName].put(value_.zh, value_);
        });
    })
    wmLibURLArr.forEach( libName => {
        commonMcache.get(libName).forEach((value_) => {
            libs[libName].put(value_.url_name, value_);
        });
    })

    // 以WM的riven数据为基本：创建了两份riven的市场对应翻译，WarframeMarketRiven => lib.wmRiven , RivenMarket => lib.rw(查到删除) => lib.rm(查到填充)
    commonMcache.get('riven_items').forEach((value_, index_) => {
        libs.wmRiven.put(value_.en,value_)
        value_.en !== value_.zh && libs.wmRiven.put(value_.zh, value_);
        if(libs['rw'].get(value_.en)){
            libs['rm'].put(value_.en, value_);
            value_.en !== value_.zh && libs['rm'].put(value_.zh, value_);
            libs.rw.del(value_.en);
        }
    })

    //加载黑话（本质是根据用户黑话对具体商品的映射，从wm数据复制了新的zh=>en关系的对象，此功能着重针对Prime Set
    initCustomLib()

    logger.info("rw :"+libs.rw.size()+" rm: "+libs.rm.size())
    logger.info(libs.rw.keys().join(','))
}

//这是一段黑话植入代码，目前仅针对Prime Set
let initCustomLib = () => {
    let sale = commonMcache.get('items')
    let customSale = customDict.map(
        da => sale.filter( db => db.en.toUpperCase().includes(da.en.toUpperCase()) )
            .map( db => { return { ...db,customZh: db.zh.toUpperCase().replace(da.en,da.zh),custom:da.zh}})
    ).flatMap(v => v)
    customSale.forEach(value_ => {
        libs['wm'].put(value_.customZh, value_);
    })
}

//将wmr的attr转换为rm的，节省字数
let wmr2rma = () =>{
    let wmr2rmaMap = {}
    Object.keys(WmRivenAttribute)
        .map(key => { 
                return {url_name:key,rm_name:statsName[WmRivenAttribute[key]]}
            }
        )
        .forEach(v => wmr2rmaMap[v.url_name] = v.rm_name )
    commonMcache.put('wmr2rma',wmr2rmaMap)
}

//请谨慎使用这两段傻逼代码，如果我没记错的话，会从wm爬一堆物品相关json下来存文件夹里，如果你不做离线化，不建议搞
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
    initLibsCache,
    lexiconLoad,
    lexiconList
};
