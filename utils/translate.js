const wfaLibs = require('./wfaLibs');
const googleTranslate = require('google-baidu-translate-api');
const googleTranslateAnother = require('translate-google');
const utils = require("./utils");
const translate = {
    translateByCache:function (original) {
        if(original)
        {
            //防止过度翻译
            if(isNode(original)){
                return preRegExpTest(original);
            }
            return getSearchStr(original,getCache);
        }
        return null;
    },
    googleTranslate: function (original, from = 'en') {
        return new Promise((resolve, reject) => {
            googleTranslate.google(original, 'zh-cn', from)
                .then(res=> resolve(res.dist))
                .catch(err=>{
                    console.log(err);
                    googleTranslateAnother(original,{from: from, to:'zh-cn'})
                        .then( res => resolve(res.text))
                        .catch( err => {
                            console.error( err )
                            resolve(original)
                        })
                })
        })
    },
    saleName:function (input) {
        return getSearchStr(input,getCache);
    },
    fuzzTran: function (input, libRange = []) {
        let _key = utils.formatter(input)
        let libArray = Object.keys(wfaLibs.libs)
            .filter(lib => !['rw', 'rd'].includes(lib))
            .filter(lib => !libRange.length > 0 || libRange.includes(lib))
        console.log(`translate lib range: ${libArray}`)
        return libArray
            .map(lib => utils.getSaleWord(_key, wfaLibs.libs[lib].keys())
                .slice(0, 5)
                .map(v => {
                    return {...v, ...wfaLibs.libs[lib].get(v.key)}
                }))
            .flatMap(v => v)
            .filter((v, i, arr) => i === arr.map(_v => _v.en).indexOf(v.en))
            .filter((v, i, arr) => !v.main || i === arr.map(_v => _v.main).indexOf(v.main))
            .sort((a, b) => b.acc - a.acc)
    }
};

function getSearchStr(original,getCache){
    const stringArray = original.split(/\\n| /);//.split(' ');   //.match(/\w+|\S/g);   //.split(/\W+/);
    if(stringArray.length === 0)
    {
        console.log('original.length === 0 !!');
        return original;
    }
    let resArr = [], start = 0, max = stringArray.length;
    outside:
    for(;start<max;start++)
    {
        for(let end=max; start<end; end--){
            const data = getCache(getStringByArray(stringArray, start, end));
            if(data.cache){
                const result = data.prefix + data.cache.zh + data.suffix;
                resArr.push(regExpTest(result));
                start = end-1;
                continue outside;
            }
        }
        if(start<max)
        resArr.push(regExpTest(stringArray[start]));
    }
    return resArr.join(' ');
}

//在这里可以做一些格式化，使用正则处理 对翻译不充分做处理
function regExpTest(result) {
    // /\d+cr$/.test('') 判断星币
    result = /\d+cr$/.test(result)?result.replace(/cr$/,'星币'):result;
    result = /Only$/.test(result)?result.replace(/Only$/,'限定'):result;
    return result;
}

function isNode(input) {
    return /^[a-zA-Z]+ \([a-zA-Z]+\)$/.test(input);
}

function preRegExpTest (input) {
    const prefix = input.replace(/\([a-zA-Z]+\)$/, '');
    const plant = input.match(/\([a-zA-Z]+\)$/).join('');
    return prefix + getSearchStr(plant,getCache);
}

function getStringByArray(arr,start,end){
    // console.log(arr.slice(start,end).join(' '));
    return arr.slice(start,end).join(' ');
}

function getCache(key){
    /** 去除首尾特殊符号 **/
    const searchKy = key.replace(/^[^a-zA-Z0-9\s]+/, '').replace(/[^a-zA-Z0-9\s]+$/, '');
    /** 保存首尾特殊符号用于还原 **/
    const prefix = key.match(/^[^a-zA-Z0-9\s]+/);
    const suffix = key.match(/[^a-zA-Z0-9\s]+$/);
    /** 查缓存 **/
    const cache = wfaLibs.libs.Dict.get(searchKy) || wfaLibs.libs.Invasion.get(searchKy) || wfaLibs.libs.Nightwave.get(searchKy) || wfaLibs.libs.Sale.get(searchKy) || wfaLibs.libs.Riven.get(searchKy);
    return {
        cache:cache,
        prefix : prefix?prefix.join(''):'',
        suffix : suffix?suffix.join(''):''
    };
}

//万用翻译


module.exports = translate;
