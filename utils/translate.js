var wfaLibs = require('./wfaLibs');
translate = {
    rewardString:function (original) {
        return getSearchStr(original,getCache);
    },
    nodeString:function (original) {
    var plant = original.match(/\((\S*)\)/);
    if(plant){
        var plant_zh = wfaLibs.libs.dict.get(plant[1]);
        return original.replace(plant[1],plant_zh.zh);
    }
        return original;
    }
};

function getSearchStr(original,getCache){
    var stringArray = original.match(/\w+|\S/g);//.split(/\W+/);
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
            if(data){
                console.log('get!');
                resArr.push(data.zh);
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
    console.log(arr.slice(start,end).join(' '));
    return arr.slice(start,end).join(' ');
}

function getCache(key){
    return wfaLibs.libs.dict.get(key) || wfaLibs.libs.invasion.get(key) || wfaLibs.libs.nightwave.get(key) || wfaLibs.libs.sale.get(key) || wfaLibs.libs.riven.get(key);
}

module.exports = translate;