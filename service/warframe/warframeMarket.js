const wfaLibs = require('../../utils/wfaLibs');
const utils = require('../../utils/utils');
const wmApi = require('../../api/warframeMarket')

const warframeMarket = {
    getInfo: async function (name, page = 1, size = 10) {
        const objs = utils.getSaleWordFromLib(name, wfaLibs.libs.wm);
        if(objs.length > 0){
            const obj = wfaLibs.libs.wm.get(objs[0].key);
            const list = (await wmApi.orders(obj.code));
            return {
                page: page,
                size: size,
                total: list.size,
                word: obj,
                words: objs.slice(1, 11),
                statistics: (await wmApi.statistics(obj.code)).slice(-1)[0],
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
            (info.statistics ? '估计价格区间：' + info.statistics.min_price + ' - ' + info.statistics.max_price + 'p\n' +
                '昨日均价：' + info.statistics.avg_price + 'p\n' : "") +
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

module.exports = warframeMarket;
