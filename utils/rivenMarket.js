const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
const utils = require('./utils');
const wfaLibs = require('../utils/wfaLibs');
const cheerio = require('cheerio');

rivenMarket = {
    getInfo:async function (name,page = 1,size = 10) {
        const objs = utils.getSaleWordFromLib(name, wfaLibs.libs.rm);
        const objs1 = utils.getSaleWordFromLib(name, wfaLibs.libs.rw);
        let obj = null;
        objs.length > 0 && (obj = wfaLibs.libs.rm.get(objs[0].key));
        if(objs1.length > 0){
            obj = wfaLibs.libs.rw.get(objs1[0].key) ;
            obj.en = objs1[0].key;
        }

        if(obj != null)
        {
            const rivenList_ = elementsToRivenList((await rivenList(obj, page, size)).data.text);
            return {
                page: page,
                size: size,
                total: rivenList_.total,
                word: obj,
                words: objs.slice(1, 11),
                seller: rivenList_.rivenList
            };
        }
         return  {
            name: name,
            word: null,
            words: [],
            seller: []
        };
    },
    robotFormatStr:async function (name) {
        const info = await this.getInfo(name, 1, 5);
        if(info.word == null && info.name!==''){
            return `未找到与${info.name}相关的武器紫卡，请尝试输入英文`;
        }
        let res = `从Riven.Market查询到'${info.word.zh?info.word.zh:info.word.en}'的紫卡信息(截取价格最低前5条):\n`;
        info.seller.forEach(((value, index) => {
            res+= '\n'+value.weapon+' '+value.name+' ('+value.price+'p)'+value.age+'\n';
            res+= value.rerolls+'洗 '+value.rank+'级 段位'+value.mr+'\n';
            for(let i=1;i<5;i++){
                if(value['stat'+i] !== '' && value['stat'+i] !== undefined)
                    res+= '\t'+value['stat'+i]+':'+value['stat'+i+'val']+'\n';
            }
            res+= 'id:'+value.seller+' ['+value.status+']\n';
        }));
        info.words.length >0 && (res += `你可能还想查：${info.words.map(v=>v.key).join('\n')}`);
        return res;
    }
};

function rivenList(obj,page,size){
    if(obj == null){
        return {
            state:'error',
            data:'词库中不包含此武器，请使用英文名再试'
        }
    }

    const weapon = obj.en.replace(' ', '_');
    const rmUrl = rivenMarketUrlCreate(size, true, weapon, 999999, page);
    return superagent
        .get(rmUrl)
        .proxy(proxyConfig.config)
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
    const rivenList = [];
    const $ = cheerio.load(text);
    const total_text = $('.pagination > .left > p').first().text();
    const total = parseInt(total_text.match(/(?<=from\s)\d+(?=\stotal)/).join());
    const rivens = $('#riven-list').find('.riven').each((index, value) => {
        const e = $(value);
        let riven = {
            id: e.attr("id"),
            weapon: e.attr("data-weapon"),
            wType: e.attr("data-wtype"),
            name: e.attr("data-name"),
            price: e.attr("data-price"),
            age: e.attr("data-age").replace("new", "新上架").replace("day", "天").replace("week", "周").replace("month", "月"),
            rank: e.attr("data-rank"),
            mr: e.attr("data-mr"),
            rerolls: e.attr("data-rerolls"),
            polarity: e.attr("data-polarity"),
            stat1: e.attr("data-stat1"),
            stat1val: e.attr("data-stat1val"),
            stat2: e.attr("data-stat2"),
            stat2val: e.attr("data-stat2val"),
            stat3: e.attr("data-stat3"),
            stat3val: e.attr("data-stat3val"),
            stat4: e.attr("data-stat4"),
            stat4val: e.attr("data-stat4val"),
            seller: e.find(".seller").text().replace(/[\s\r\n]+/g, ''),
            status: e.find('div').is(".ingame") ? 'ingame' : (e.find('div').is(".offline") ? 'offline' : 'online')
        };
        riven = setRivenProperty(riven);
        rivenList.push(riven);
    });
    return {
        rivenList: rivenList,
        total: total
    };
}

function setRivenProperty(riven){
    for(let i=1; i<5; i++){
        const property = getProperty(riven['stat' + i]);
        if(property){
            riven['stat'+i] = property.Name;
            riven['stat'+i+'val'] = getPre(property.Pre,i)+ riven['stat'+i+'val']+property.Unit;
        }
        // else {
        //     delete riven['stat'+i];
        //     delete riven['stat'+i+'val'];
        // }
    }
    return riven;
}

function getProperty( property ){
    return wfaLibs.libs.rd.get(property);
    // return ( property === '' || property === undefined ) ? null : rivenProperty[property];
}

function getPre(pre,i){
    pre = pre.replace('Slide Attack has ','滑行攻击时');
    return i === 4 ? (pre.indexOf('+')>-1 ? pre.replace('+','-') : pre.replace('-','+') ) : pre ;
}
module.exports = rivenMarket;
