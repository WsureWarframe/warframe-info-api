const utils = require('../../utils/utils')
const { getJson,getText } = require('../../utils/superagent')
const config = require("../../config/myConfig");
const logger = require('../../utils/logger')(__filename)

const WARFRAMESTAT_HOST = "https://api.warframestat.us/pc"
let queryWorldState = () => getJson(WARFRAMESTAT_HOST)

module.exports = { queryWorldState }
