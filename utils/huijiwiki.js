var superagent = require('superagent');
var propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
var utils = require('./utils');
var wfaLibs = require('../utils/wfaLibs');
var cheerio = require('cheerio');

huijiwiki ={
    getInfo: async function (name, page = 1, size = 10) {
        return await wikiList(name, page, size);
    }
};

function getUrl(name,page,size){
    var offset = (page - 1) * size ;
    var search = encodeURIComponent(name);
    return 'https://warframe.huijiwiki.com/index.php?title=%E7%89%B9%E6%AE%8A:%E6%90%9C%E7%B4%A2&limit='+size+'&offset='+offset+'&profile=default&search='+search;
}

function wikiList(name,page,size){
    var wikiUrl = getUrl(name,page,size);
    return superagent
        .get(wikiUrl)
        .proxy(propxyConfig.config)
        .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        .then(res=>({
            state:'success',
            data:res
        })).catch(err=>({
            state:'error',
            data:err
        }))
}

module.exports = huijiwiki;
