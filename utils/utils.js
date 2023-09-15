const moment = require('moment');
const mcache = require('memory-cache');
const robotJson = require("../service/robot/robot.json");
const logger = require('../utils/logger')(__filename)
//require 方式
require('moment/locale/zh-cn');
const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
moment.locale('zh-cn');
const path = require('path');
const fs = require('fs');

const oneDay =  24 * 60 * 60 * 1000;

const utils = {
    delay:function (time){
        return new Promise(resolve => setTimeout(resolve, time))
    },
    customerRecord:{
        request: new mcache.Cache(),
        menu: new mcache.Cache()
    },
    apiTimeUtil: function (str) {
        const time = moment(str);
        return {
            localTime: time.toDate().toLocaleString(),
            fromNow: time.fromNow(),
            toNow: time.toNow(),
            diff: timeDiff(moment(), time)
        };
    },
    timeDiff: function (t1, t2) {
        return timeDiff(t1 ? moment(t1) : moment(), t2 ? moment(t2) : moment());
    },
    eta: function (str) {
        return str
            .replace(/ /g, '')
            .replace(/d/g, '天')
            .replace(/h/g, '小时')
            .replace(/m/g, '分')
            .replace(/s/g, '秒')
            ;
    },
    dateFormat(str,pattern = 'YYYY-MM-DD HH:mm:ss'){
        return moment(str,'MM/DD/YYYY, hh:mm:ss a').format(pattern)
    },
    formatExpiry(str){
        return moment(str,'MM/DD/YYYY, hh:mm:ss a')
    },
    testType: function (type) {
        if (type === 'Ostrons' || type === 'Solaris'|| type === 'EntratiSyndicate'|| type === 'Entrati') {
            return 'syndicateMissions';
        }
        return type;
    },
    formatter: function (string) {
        return string.toString().toUpperCase().replace(/\s/g, '')
    },
    getAcc: function (key, word, thick) {
        const acc = key.length / word.length;
        const thick_ = key.length / (thick[thick.length - 1] - thick[0] === 0 ? 1 : (thick[thick.length - 1] - thick[0]));
        const head = word.indexOf(key) === 0 ? 1 : 0;
        const set = word.indexOf('一套') > -1 ? 1 : 0;
        const prime = word.indexOf('PRIME') > -1 ? 1 : 0;
        const result = acc * 0.15 + thick_ * 0.2 + head * 0.2 + set * 0.1 + 0.05 * prime;
        // logger.info('key:'+key+' word:'+word+' acc'+acc+' thick'+thick_+' head:'+head+' result:'+result);
        return result;
    },
    comparison: function (key_, word_) {
        const key = this.formatter(key_);
        const word = this.formatter(word_);
        //查询词
        const keyA = key.split('');
        //词库里的词
        const wordA = word.split('');
        let i = 0, len = 0, thick = [];
        keyA.forEach((value, index, array) => {
            for (let j = i; j < wordA.length; j++) {
                if (value === wordA[j]) {
                    thick.push(j);
                    i = j;
                    len++;
                    break;
                }
            }
        });
        const state = len === keyA.length;
        return state ? {state: state, acc: this.getAcc(key, word, thick), key: word_} : {state: state, key: word};
    },
    getSaleWordFromLib:function (key, lib) {
        return this.getSaleWord(key,lib.keys())
            .map( v => {
                let word = lib.get(v.key)
                return {
                    ...v,
                    key: word.customZh ? word.zh :v.key
                }
            } )
    },
    getSaleWord: function (key, words) {
        const res = [];
        words.forEach((value) => {
            const obj = this.comparison(key, value);
            if (obj.state) {
                res.push(obj);
            }
        });
        const resSort = res.sort(function (a, b) {

            return b.acc - a.acc;
        });
        return resSort.slice(0, 11);
    },
    getRequest: (url) => {
        return new Promise((resolve, reject) => {
            superagent
                .get(url)
                .proxy(proxyConfig.config)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
                .set('Accept', 'text/html')
                .then(res => {
                    if (res.header['content-type'] === 'application/javascript')
                        res.text = res.body.toString('utf8');
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
        });
    },
    getJsonResult: (url) => {
        return new Promise((resolve, reject) => {
            superagent
                .get(url)
                .proxy(proxyConfig.config)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
                .then(res => {
                    logger.info(res)
                    resolve(res.body);
                }).catch(err => {
                    console.error(err)
                    resolve(null)
                })
        });
    },
    async cacheUtil(key, data, timeout) {
        let result = null;
        if (!mcache.get(key)) {
            logger.info(`set cache , key:${key}`);
            result = await data();
            await mcache.put(key, result, timeout, () => {
            })
        } else {
            logger.info(`get cache , key:${key}`);
            result = mcache.get(key)
        }
        return result;
    },
    checkIsJSON: function (str) {
        if (typeof str == 'string') {
            try {
                const obj = JSON.parse(str);
                return !!(typeof obj == 'object' && obj);
            } catch (e) {
                return false;
            }
        }
        return false;
    },
    getIp:getClientIp,
    recordCustomer(req){
        let ip = this.getIp(req)

        let command = robotJson.commands.filter(cmd => req.originalUrl.includes(cmd.path))[0]
        if(command){
            let url = {
                key:command.alia,
                param:command.type === 'PARAM' ? req.originalUrl.match(new RegExp(`(?<=${command.path}).*?((?=\\?)|(?=$))`)).join('') : command.path.match(/(?<=\/)\w+$/).join(''),
                originalUrl:req.originalUrl,
                bots :req.query.bots,
                users:req.query.users
            }
            let storeKey = `${url.key}::${url.param}`
            let result = this.customerRecord.menu.get(storeKey);

            if (!result) {
                result = {
                    key:url.key,
                    param:url.param,
                    bots:url.bots?[url.bots]:[],
                    users:url.users?[url.users]:[],
                    count:1
                }
            } else {
                result.count += 1;
                if(url.bots && !result.bots.includes(url.bots)){
                    result.bots.push(url.bots)
                }
                if(url.users && !result.users.includes(url.users)){
                    result.users.push(url.users)
                }
            }
            this.customerRecord.menu.put(storeKey, result, oneDay, () => {
            })
        }

        let record = {
            ip:ip,
            hash:req.fingerprint.hash,
            ...req.fingerprint.components
        }
        //save
        this.customerRecord.request.put(record.hash, record, oneDay , (k,v) => {
            logger.info('设备离线超过一天:',JSON.stringify(v))
        })
    },
    createDirIfNotExist:function (dir){
        return new Promise( (resolve, reject) => {
            const exists = fs.existsSync(dir);
            if(!exists){
                fs.mkdir(dir, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        logger.info(`目录创建${dir}成功。`);
                        resolve()
                    }
                });
            } else {
                resolve()
            }
        })
    },
    writeJsonFile:function (path,json){
        return new Promise((resolve, reject) => {
            try {
                let text = typeof json  == 'string' ? json : JSON.stringify(json)
                fs.writeFileSync(path,text)
                resolve()
            }catch (err){
                reject(err)
            }
        })
    },
    readJsonFile:function (path){
        return new Promise((resolve, reject) => {
            try {
                let text = fs.readFileSync(path)
                let json = JSON.parse(text)
                resolve(json)
            }catch (err){
                reject(err)
            }
        })
    },
    readFileList:function (path){
        return new Promise((resolve, reject) => {
            try {
                let fileList = fs.readdirSync(path)
                resolve(fileList)
            }catch (err){
                reject(err)
            }
        })
    },
    // {n:'n',a:1} {n:'n',b:2} => {n:'n',a:1,b:2} , apply:match
    mergeArray:(arr1 = [],arr2=[],matchItem,merge = (v1,v2)=>{ return {...v1,...v2}})=>{
        let map = {}
        arr2.forEach( item => {
            map[matchItem(item)] = item
        })
        return arr1.map( item => {
            let value2 = map[matchItem(item)]
            return merge(item,value2)
        })
    }
};

function timeDiff(t1, t2) {
    const prefix = t2.diff(t1) > 0 ? '还剩余' : '已过去';
    return prefix + millisecondToString(Math.abs(t2.diff(t1)));
}

function millisecondToString(mss = 0) {
    const days = parseInt(mss / (1000 * 60 * 60 * 24));
    const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = parseInt((mss % (1000 * 60)) / 1000);
    return (days === 0 ? '' : days + '天') +
        (hours === 0 ? '' : hours + '小时') +
        (minutes === 0 ? '' : minutes + '分') +
        (seconds === 0 ? '' : seconds + '秒');
}

function getClientIp(req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':')+1,ip.length);
    return ip;
}

module.exports = utils;
