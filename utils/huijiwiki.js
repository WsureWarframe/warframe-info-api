var superagent = require('superagent');
var propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
var utils = require('./utils');
var wfaLibs = require('../utils/wfaLibs');
var cheerio = require('cheerio');
var puppeteerUtil = require('../utils/puppeteerFullShot');

huijiwiki ={
    getInfo: async function (name, page = 1, size = 10) {
        var res = await wikiHtml(getListUrl(name,page,size));
        if(res.state === 'success')
        {
            var obj = elementsToList(res.data.text);
            var data = {
                state:'success',
                page:page,
                size:size,
                total:obj.total,
                wiki:obj.wikiList
            };
            if(obj.wikiList.length >0 ) {
                var wikiObj ;
                obj.wikiList.forEach(value => {
                    if (value.title.toString().toLowerCase() === name.toString().toLowerCase()){
                        wikiObj = value;
                    }
                });
                wikiObj = wikiObj?wikiObj:obj.wikiList[0];
                data['detail'] = wikiObj;
                var detailObj = await wikiHtml(wikiObj.url);
                if(detailObj.state === 'success')
                {
                    data['detail']['html'] = elementsToText(detailObj.data.text)
                } else {
                    data['detail']['html'] = "error";
                }
            }
            return data;
        }
        else {
            return res;
        }
    },
    async getDetail(name) {
        var listInfo = await this.getInfo(name);
        if(listInfo.state === 'success' ){
            var data = listInfo.detail;
            data['screenshot'] = await puppeteerUtil(data.title);
            return data;
        } else {
            return listInfo;
        }
    }
};

function getListUrl(name,page,size){
    var offset = (page - 1) * size ;
    var search = encodeURIComponent(name);
    return 'https://warframe.huijiwiki.com/index.php?title=%E7%89%B9%E6%AE%8A:%E6%90%9C%E7%B4%A2&limit='+size+'&offset='+offset+'&profile=default&search='+search;
}
function getDetailUrl(url){
    return 'https://warframe.huijiwiki.com'+url;
}
function wikiHtml(wikiUrl){
    var req = superagent
        .get(wikiUrl)
        .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        // .set('Content-Type', 'application/x-www-form-urlencoded')
        .then(res=>({
            state:'success',
            data:res
        })).catch(err=>({
            state:'error',
            data:err
        }));
    if(propxyConfig.config)
        req.proxy(propxyConfig.config);
    return req;
}
function elementsToText(text){
    var $ = cheerio.load(text);
    $('.mw-parser-output > table').last().remove();
    $('.mw-parser-output > div').attr('style','width:100%;text-align:center;').remove();
    return $('.mw-parser-output').first().text();//.replace(/[\n\t]+/g,'\n');
}
function elementsToList(text){
    var wikiList = [];
    var $ = cheerio.load(text);
    var total = parseInt($('.results-info').attr('data-mw-num-results-total'));
    $('.mw-search-results').find('li').each((index,value)=>{
        var e = $(value);
        var heading = e.find('.mw-search-result-heading > a');
        var result = e.find('.searchresult');
        var result_data = e.find('.mw-search-result-data');
        var wiki = {
            url:getDetailUrl(heading.attr('href')),
            title:heading.attr('title'),
            result:result.text(),
            result_data:result_data.text()
        };
        wikiList.push(wiki);
    });
    return {
        wikiList: wikiList,
        total: total
    };
}
module.exports = huijiwiki;
