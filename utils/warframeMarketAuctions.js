const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
const utils = require('./utils');
const wfaLibs = require('../utils/wfaLibs');


const warframeMarketAuctions = {
    getUrl: (type = 'riven',name) =>{
        return `https://api.warframe.market/v1/auctions/search?type=${type}&weapon_url_name=${name}&polarity=any&sort_by=price_desc`
    },
    getProductList:(url) => {

    }


}

module.exports = warframeMarketAuctions
