var wfaLibs = require('./wfaLibs');
const googleTranslate = require('google-translate-api');
translate = {
    translateByCache:function (original) {
        if(original)
            return getSearchStr(original,getCache);
        return null;
    },
    googleTranslate:function (original,from) {
        return googleTranslate(original,{from:from,to:'zh'}).then(res=>{
            return res.text;
        }).catch(err=>{
            return err;
        })
    }
};

function getSearchStr(original,getCache){
    var stringArray = original.split(/\\n| /);//.split(' ');   //.match(/\w+|\S/g);   //.split(/\W+/);
    if(stringArray.length === 0)
    {
        console.log('original.length === 0 !!');
        return original;
    }
    var resArr = [],start = 0, max = stringArray.length;
    outside:
    for(;start<max;start++)
    {
        for(var end=max;start<end;end--){
            var data = getCache(getStringByArray(stringArray,start,end));
            if(data.cache){
                console.log('get!');
                resArr.push(data.prefix+data.cache.zh+data.suffix);
                start = end-1;
                continue outside;
            }
        }
        if(start<max)
        resArr.push(stringArray[start]);
    }
    return resArr.join(' ');
}

function getStringByArray(arr,start,end){
    // console.log(arr.slice(start,end).join(' '));
    return arr.slice(start,end).join(' ');
}

function getCache(key){
    var searchKy = key.replace(/^[^a-zA-Z0-9\s]+/,'').replace(/[^a-zA-Z0-9\s]+$/,'');
    var prefix = key.match(/^[^a-zA-Z0-9\s]+/);
    var suffix = key.match(/[^a-zA-Z0-9\s]+$/);
    var cache = wfaLibs.libs.dict.get(searchKy) || wfaLibs.libs.invasion.get(searchKy) || wfaLibs.libs.nightwave.get(searchKy) || wfaLibs.libs.sale.get(searchKy) || wfaLibs.libs.riven.get(searchKy);
    return {
        cache:cache,
        prefix : prefix?prefix.join(''):'',
        suffix : suffix?suffix.join(''):''
    };
}

module.exports = translate;