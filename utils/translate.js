const wfaLibs = require('./wfaLibs');
const googleTranslate = require('google-baidu-translate-api');
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
        return googleTranslate.google(original, 'zh-cn', from)
        //     .then(res=>{
        //     console.log(res);
        //     return res.text;
        // }).catch(err=>{
        //     console.log(err);
        //     return err;
        // })
    },
    saleName:function (input) {
        return getSearchStr(input,getCache);
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
    const cache = wfaLibs.libs.dict.get(searchKy) || wfaLibs.libs.invasion.get(searchKy) || wfaLibs.libs.nightwave.get(searchKy) || wfaLibs.libs.sale.get(searchKy) || wfaLibs.libs.riven.get(searchKy);
    return {
        cache:cache,
        prefix : prefix?prefix.join(''):'',
        suffix : suffix?suffix.join(''):''
    };
}

module.exports = translate;
