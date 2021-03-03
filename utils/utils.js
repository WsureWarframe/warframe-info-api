const moment = require('moment');
const mcache = require('memory-cache');
//require 方式
require('moment/locale/zh-cn');
const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
moment.locale('zh-cn');
const utils = {
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
    testType: function (type) {
        if (type === 'Ostrons' || type === 'Solaris'|| type === 'EntratiSyndicate') {
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
        // console.log('key:'+key+' word:'+word+' acc'+acc+' thick'+thick_+' head:'+head+' result:'+result);
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
    async cacheUtil(key, data, timeout) {
        let result = null;
        if (!mcache.get(key)) {
            console.log(`set cache , key:${key}`);
            result = await data();
            await mcache.put(key, result, timeout, () => {
            })
        } else {
            console.log(`get cache , key:${key}`);
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

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

module.exports = utils;
