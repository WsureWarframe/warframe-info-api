var tran = require('./translate');
var wfaLibs = require('../utils/wfaLibs');
var utils = require('./utils');
var superagent = require('superagent');
var propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);

var warframeMarket = {
    getInfo: async function (name,page = 1,size = 10) {
        var objs = utils.getSaleWord(name, wfaLibs.libs.wm.keys());
        var obj = objs.length > 0 ? wfaLibs.libs.wm.get(objs[0].key) : null;
        var list = (await wmOrders(obj.search)).data;
        return obj ? {
            page: page,
            size: size,
            total: list.size,
            word: obj,
            words: objs.slice(1, 11),
            statistics: (await wmStatistics(obj.search)).data.slice(-1)[0],
            seller: list.slice((page-1)*size,page*size)
        } : {
            word: obj,
            words: objs,
            seller: []
        };
    },
    robotFormatStr:async function (name) {
        var info = await this.getInfo(name,1,5);
        var res = '你查询的物品是:'+info.word.zh+' ('+info.word.search+')\n' +
            '估计价格区间：'+info.statistics.min_price+' - '+info.statistics.max_price+'p\n' +
            '昨日均价：'+info.statistics.avg_price+'p\n' +
            '从'+info.seller.length+'位在线卖家中捕获到top5卖家信息(>^ω^<)\n' ;
        info.seller.slice(0,5).forEach((value, index) => {
            res+=(value.user.ingame_name+'(状态:'+value.user.status+') : '+value.platinum+'p(数量:'+value.quantity+')\n')
        });
        if(info.words.length>0)
            res +='你可能要找:\n';
        info.words.slice(0,5).forEach((value, index) => {
            res+=(value.key+(index===4?'':'\n'))
        });
        return res;
    }
};

function wmOrders(name = 'primed_chamber'){
    var wmUrl = 'https://api.warframe.market/v1/items/'+name+'/orders';
    return superagent
        .get(wmUrl)
        .proxy(propxyConfig.config)
        .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        .then(res=>({
            state:'success',
            data:res.body.payload.orders.filter(function (item) {
                return item.order_type === 'sell'&&item.user.status !== 'offline';
            }).sort(function (a,b) {
                return a.platinum-b.platinum;
            }).concat(res.body.payload.orders.filter(function (item) {
                return item.order_type === 'sell'&&item.user.status === 'offline';
            }).sort(function (a,b) {
                return a.platinum-b.platinum;
            }))
        })).catch(err=>({
            state:'error',
            data:err
        }))
}

function wmStatistics(name = 'primed_chamber'){
    var wmUrl = 'https://api.warframe.market/v1/items/'+name+'/statistics';
    return superagent
        .get(wmUrl)
        .proxy(propxyConfig.config)
        .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        .then(res=>({
            state:'success',
            data:res.body.payload.statistics_live['90days']
        })).catch(err=>({
            state:'error',
            data:err
        }))
}

module.exports = warframeMarket;
