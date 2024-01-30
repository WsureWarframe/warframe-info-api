const superagent = require('superagent');
require('superagent-proxy')(superagent);
const moment = require('moment');
const wmApi = require('../../api/warframeMarket')
const utils = require('../../utils/utils');
const wfaLibs = require('../../utils/wfaLibs');


const warframeMarketAuctions = {
    getInfo: async function (name, baseType = 'riven', page = 1, size = 10) {
        const isRiven = baseType === 'riven' 
        const objs =  isRiven ? 
            utils.getSaleWordFromLib(name, wfaLibs.libs.wmRiven) : 
            utils.getSaleWordFromLib(name, wfaLibs.libs.auctionsWeapons) 
        if(objs.length > 0){
            const obj = isRiven ? wfaLibs.libs.wmRiven.get(objs[0].key) : wfaLibs.libs.auctionsWeapons.get(objs[0].key);
            const type = isRiven ? baseType :obj.type 
            let list = await wmApi.auctionsSearch(type,obj.url_name)
            return {
                type,
                name,
                page,
                size,
                total: list.size,
                word: obj,
                words: objs.slice(1, 11),
                seller: list.slice((page - 1) * size, page * size)
            }
        }
        return {
            name: name,
            word: null,
            words: [],
            seller: []
        };
    },
    robotFormatStr: async function (name, baseType = 'riven') {
        let info = await this.getInfo(name,baseType,1,5)
        const isRiven = baseType === 'riven' 
        if(info.word){
            return isRiven ? this.rivenFormatStr(info) : this.weaponFormatStr(info)
        } else {
            return `未找到与${name}相关的${isRiven ? '紫卡，请尝试输入英文' : '玄骸武器，请尝试简化输入内容'}`;
        }
    },
    rivenFormatStr: function(info){
        let en_name = info.word.en ?? info.word.zh
        let res = `从Warframe.Market查询到'${info.word.zh ?? info.word.en} [${info.word.url_name}]'的紫卡信息(截取价格最低前5条):\n\n`;
        info.seller.forEach(((value, index) => {
            res+= `${en_name} ${value.item.name} `
            res+= value.is_direct_sell ? `(一口价:${value.starting_price}p)` : `(底价:${value.starting_price}->现价:${value.buyout_price}p)`
            res+= ` ${age(value.created)}\n`
            res+= value.item.re_rolls+'洗 '+value.item.mod_rank+'级 段位'+value.item.mastery_level+'\n';
            value.item.attributes.forEach(attr => {
                let attrDict = wfaLibs.libs.riven_attributes.get(attr.url_name)
                let unit = attrDict.units === 'multiply' ? 'x' 
                    : attrDict.units === 'percent' ? '%' 
                    : ''
                res += `\t ${attrDict.rm_name??attrDict.zh??attr.url_name}:${attr.value}${unit}\n`
            })
            res+= `id:${value.owner.ingame_name} (${value.platform})[${value.owner.status}]\n\n`
        }));
        info.words.length >0 && (res += `你可能还想查：${info.words.map(v=>v.key).join('\n')}`);
        return res;
    },
    weaponFormatStr: function(info){
        let res = `从Warframe.Market查询到'${info.word.zh ?? info.word.en} [${info.word.url_name}]'的玄骸信息(截取价格最低前5条):\n\n`;
        info.seller.forEach(((value, index) => {
            res+= `${element2emoji(value.item.element)} ${value.item.damage}% ${value.item.having_ephemera? wfaLibs.libs.ephemeras.get(value.item.element).zh :''}\n`
            res+= value.is_direct_sell ? `(一口价:${value.starting_price}p)` : `(底价:${value.starting_price}->现价:${value.buyout_price}p)`
            res+= `${age(value.created)}\n`
            res+= `id:${value.owner.ingame_name} (${value.platform})[${value.owner.status}]\n\n`
        }));
        info.words.length >0 && (res += `你可能还想查：${info.words.map(v=>v.key).join('\n')}`);
        return res;
    }
}

let age = (created) => {
    let createdTime = moment.parseZone(created)
    let mss = moment().utc().diff(createdTime)
    const days = parseInt(mss / (1000 * 60 * 60 * 24));
    if(days < 1)            return '<1天'
    else if(days < 3)       return '<3天'
    else if(days < 7)       return '>3天'
    else if(days < 30)      return '>1周'
    else if(days < 365)     return '>1月'
    else                    return '>1年'
}

let element2emoji = (element) => {
    switch(element){
        case 'cold'         : return "❄️"
        case 'electricity'  : return "⚡"
        case 'heat'         : return "🔥"
        case 'impact'       : return "🔨"
        case 'magnetic'     : return "🧲"
        case 'radiation'    : return "☢️"
        case 'toxin'        : return "☠️"
    }
}

module.exports = warframeMarketAuctions
