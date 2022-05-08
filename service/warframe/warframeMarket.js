const tran = require('../../utils/translate');
const wfaLibs = require('../../utils/wfaLibs');
const utils = require('../../utils/utils');
const superagent = require('superagent');
const proxyConfig = require('../../config/proxyConfig');
require('superagent-proxy')(superagent);

const warframeMarket = {
    getInfo: async function (name, page = 1, size = 10) {
        const objs = utils.getSaleWordFromLib(name, wfaLibs.libs.wm);
        if(objs.length > 0){
            const obj = wfaLibs.libs.wm.get(objs[0].key);
            const list = (await wmOrders(obj.code)).data;
            return {
                page: page,
                size: size,
                total: list.size,
                word: obj,
                words: objs.slice(1, 11),
                statistics: (await wmStatistics(obj.code)).data.slice(-1)[0],
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
    robotFormatStr: async function (name) {
        const info = await this.getInfo(name, 1, 5);
        if(info.word == null && info.name!==''){
            return `未找到任何与${info.name}相关的物品`
        }
        let res = '你查询的物品是:' + info.word.zh + ' (' + info.word.code + ')\n' +
            '估计价格区间：' + info.statistics.min_price + ' - ' + info.statistics.max_price + 'p\n' +
            '昨日均价：' + info.statistics.avg_price + 'p\n' +
            '从' + info.seller.length + '位在线卖家中捕获到top5卖家信息(>^ω^<)\n';
        info.seller.slice(0, 5).forEach((value, index) => {
            res += (value.user.ingame_name + '(状态:' + value.user.status + ') : ' + value.platinum + 'p(数量:' + value.quantity + ')\n')
        });
        if (info.words.length > 0)
            res += '你可能要找:\n';
        info.words.slice(0, 5).forEach((value, index) => {
            res += (value.key + (index === 4 ? '' : '\n'))
        });
        return res;
    }
};

function wmOrders(name = 'primed_chamber'){
    const wmUrl = 'https://api.warframe.market/v1/items/' + name + '/orders';
    return superagent
        .get(wmUrl)
        .proxy(proxyConfig.config)
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
    const wmUrl = 'https://api.warframe.market/v1/items/' + name + '/statistics';
    return superagent
        .get(wmUrl)
        .proxy(proxyConfig.config)
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
