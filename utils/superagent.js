const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
const logger = require('./logger')(__filename)

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36"

const getJson = (url,header = {}) => {
    return new Promise((resolve, reject) => {
        superagent
            .get(url)
            .proxy(proxyConfig.config)
            .set({...header,'User-Agent':UA})
            .then(res => {
                logger.info(`getJson url: ${url}`)
                resolve(res.body)
            })
            .catch(err => {
                logger.error(`getJson url: ${url} Fail !`)
                console.log(err)
                reject(err)
            })
    })
}

const getText = (url,header = {}) => {
    return new Promise((resolve, reject) => {
        superagent
            .get(url)
            .proxy(proxyConfig.config)
            .set({...header,'User-Agent':UA})
            .then(res => {
                logger.info(`getText url: ${url}`)
                if (res.header['content-type'] === 'application/javascript')
                    res.text = res.body.toString('utf8');
                resolve(res.text)
            })
            .catch(err => {
                logger.error(`getText url: ${url} Fail !`)
                console.log(err)
                reject(err)
            })
    })
}

module.exports = { getJson,getText }
