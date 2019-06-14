var superagent = require('superagent');
var propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
var utils = require('./utils');
var wfaLibs = require('../utils/wfaLibs');
var cheerio = require('cheerio');

rivenMarket = {
    getInfo:async function (name) {
        var objs = utils.getSaleWord(name, wfaLibs.libs.riven.keys());
        var obj = objs.length > 0 ? wfaLibs.libs.rm.get(objs[0].key) : null;
        return obj ? {
            word: obj,
            words: objs.slice(1, 11),
            seller: elementsToRivenList((await rivenList(obj)).data.text)
        } : {
            word: obj,
            words: objs,
            seller: []
        };
    }
};

function rivenList(obj){
    var weapon = obj.en.replace(' ','_');
    var rmUrl = rivenMarketUrlCreate(5, true, weapon, 9999, 1);
    return superagent
        .get(rmUrl)
        .proxy(propxyConfig.config)
        .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        .then(res=>({
            state:'success',
            data:res
        })).catch(err=>({
            state:'error',
            data:err
        }))
}

function rivenMarketUrlCreate(limit, onlinefirst, weapon, price, page)
{
    return "https://riven.market/_modules/riven/showrivens.php?baseurl=Lw==" +
        "&platform=PC" +
        "&limit=" +limit+
        "&recency=-1" +
        "&veiled=false" +
        "&onlinefirst=" +onlinefirst+
        "&polarity=all" +
        "&rank=all" +
        "&mastery=16" +
        "&weapon=" +weapon+
        "&stats=Any" +
        "&neg=all" +
        "&price=" +price+
        "&rerolls=-1" +
        "&sort=price" +
        "&direction=ASC" +
        "&page=" +page+
        "&time="+new Date().getTime();
}

function elementsToRivenList(text){
    var rivenList = [];
    var $ = cheerio.load(text);
    var rivens = $('#riven-list').find('.riven').each((index,value)=>{
       var e = $(value);
       var riven = {
            id : e.attr("id"),
           weapon : e.attr("data-weapon"),
           wType : e.attr("data-wtype"),
           name : e.attr("data-name"),
           price : e.attr("data-price"),
           age : e.attr("data-age").replace("new","新上架").replace("day","天").replace("week","周").replace("month","月"),
           rank : e.attr("data-rank"),
           mr : e.attr("data-mr"),
           rerolls : e.attr("data-rerolls"),
           polarity : e.attr("data-polarity"),
           stat1 : e.attr("data-stat1"),
           stat1val : e.attr("data-stat1val"),
           stat2 : e.attr("data-stat2"),
           stat2val : e.attr("data-stat2val"),
           stat3 : e.attr("data-stat3"),
           stat3val : e.attr("data-stat3val"),
           stat4 : e.attr("data-stat4"),
           stat4val : e.attr("data-stat4val"),
           seller : e.find(".seller").text().replace(/[\s\r\n]+/g,''),
           status : e.find('div').is(".ingame")?'ingame':(e.find('div').is(".offline")?'offline':'online')
       };
       rivenList.push(riven);
    });
    return rivenList;
}
module.exports = rivenMarket;
