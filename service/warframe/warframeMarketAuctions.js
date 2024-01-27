const superagent = require('superagent');
require('superagent-proxy')(superagent);

const wmApi = require('../../api/warframeMarket')
const utils = require('../../utils/utils');
const wfaLibs = require('../../utils/wfaLibs');


const warframeMarketAuctions = {
    getInfo: async function (name, baseType = 'riven', page = 1, size = 10) {
        const isRiven = baseType == 'riven' 
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
        let list = this.getInfo(name,baseType,1,5)

    }


}

module.exports = warframeMarketAuctions
