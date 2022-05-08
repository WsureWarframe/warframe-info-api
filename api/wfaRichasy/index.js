const utils = require('../../utils/utils')
const { getJson,getText } = require('../../utils/superagent')
const config = require("../../config/myConfig");
const logger = require('../../utils/logger')(__filename)

let getWfaLexiconFromGithub = async () => {
    let remoteMap = {}
    for (let key of Object.keys(config.lexiconMap)) {
        remoteMap[key] = await getText(config.wfaLexicon + "WF_" + config.lexiconMap[key],{Accept: 'text/html'})
            .then(res => JSON.parse(res.text))
            .catch(e => require(`../../utils/lexicon/${config.lexiconMap[key]}`))
        logger.info(`${key} - length :${remoteMap[key].length}`)
    }
    return remoteMap
}

module.exports = { getWfaLexiconFromGithub }
