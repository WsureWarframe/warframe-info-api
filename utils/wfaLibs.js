const mcache = require('memory-cache');
const localLib = require('./dict/localLibs');
const localRivenData = require('./dict/localRivenData');
const statsName = require('./dict/RivenStatsName.json');
const wfaLibrarySchedule = require('../schedule/wfaLibrarySchedule');
const customDict = require('./dict/custom.json');

const libs = {
    Dict: new mcache.Cache(),
    Sale: new mcache.Cache(),
    Riven: new mcache.Cache(),
    Nightwave: new mcache.Cache(),
    Invasion: new mcache.Cache(),

    wm: new mcache.Cache(),
    rm: new mcache.Cache(),
    /* riven weapon */
    rw: new mcache.Cache(),
    /* riven dict (stats)*/
    rd: new mcache.Cache(),
};
/* GET users listing. */
const wfaLibs = {
    commonMcache: new mcache.Cache(),
    libs: libs,
    libsArr: ['Dict', 'Sale', 'Riven', 'Nightwave', 'Invasion'],
    initRWCache(that,rivenData){
        Object.keys(rivenData.weaponData).forEach(type =>{
            Object.keys(rivenData.weaponData[type]).forEach(weapon=>{
                that.libs.rw.put(weapon.replace(/_/g,' '),rivenData.weaponData[type][weapon]);
            })
        });
        console.log("rw:"+ that.libs.rw.size());
        Object.keys(rivenData.statsData).forEach(stats =>{
            let word = rivenData.statsData[stats];
            word.Name = statsName[stats] ? statsName[stats] : stats;
            that.libs.rd.put(stats,word);
        });
        console.log("rd:"+ that.libs.rd.size());
    },
    initLibsCache(that) {
        that.libsArr.forEach(function (value, index, array) {
            console.log(value);
            // that.libs[value].put(value,index);
            // console.log(value,that.libs[value].get(value))
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

            that.commonMcache.get(value).forEach(function (value_, index_) {

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

        console.log("rw :"+that.libs.rw.size()+" rm: "+that.libs.rm.size())
        console.log(that.libs.rw.keys().join(','))
    },
    initLocalLib(that) {

        that.libsArr.forEach(function (value) {
            that.commonMcache.put(value, localLib[value])
        })
    },
    initLocalRW(that){
        that.initRWCache(that,localRivenData);
    },
    initOnlineLib: async (that) => {
        let library = await wfaLibrarySchedule.getWfaLibCache(wfaLibrarySchedule);
        that.libsArr.forEach(function (value) {
            that.commonMcache.put(value, library[value])
        })
    },
    initOnlineRW:async (that) => {
        let library = await wfaLibrarySchedule.getWfaLibCache(wfaLibrarySchedule);
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
    }
};

module.exports = wfaLibs;
