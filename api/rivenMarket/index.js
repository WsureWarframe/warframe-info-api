const utils = require('../../utils/utils')
const { getJson,getText } = require('../../utils/superagent')
const logger = require('../../utils/logger')(__filename)
const RMHost = 'https://riven.market';

module.exports = {
    getRivenMarketData:() => new Promise(async (resolve, reject) => {
        let mainPageUrl = RMHost + '/list/PC'
        await getText(mainPageUrl)
            //获取页面上js地址
            .then(mainPage => { return mainPage.match(/(?<=src=").+warframeData.+?(?=")/).join();})
            //获取js内容
            .then(jsUrl => getText(RMHost+jsUrl) )
            //构造module 方便直接调用其中数据
            .then(jsContext => {
                if (jsContext !== '') {
                    const Module = require('module');
                    const rivenData = new Module("riven-data");
                    rivenData._compile(`${jsContext}
                             module.exports = { statsData : statsData ,weaponData : weaponData };`, 'riven-data');
                    logger.info(`riven-data create success`);
                    resolve(rivenData.exports);
                } else {
                    reject()
                }
            })
            .catch(e => reject())
    })


}
