const superagent = require('superagent');
const propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);
const utils = require('./utils');
const wfaLibs = require('../utils/wfaLibs');
const cheerio = require('cheerio');
const puppeteerUtil = require('../utils/puppeteerFullShot');

huijiwiki ={
    getInfo: async function (name, page = 1, size = 10) {
        const res = await wikiHtml(getListUrl(name, page, size));
        if(res.state === 'success')
        {
            const obj = elementsToList(res.data.text);
            const data = {
                state: 'success',
                page: page,
                size: size,
                total: obj.total,
                wiki: obj.wikiList
            };
            if(obj.wikiList.length >0 ) {
                let wikiObj;
                obj.wikiList.forEach(value => {
                    if (value.title.toString().toLowerCase() === name.toString().toLowerCase()){
                        wikiObj = value;
                    }
                });
                wikiObj = wikiObj?wikiObj:obj.wikiList[0];
                data['detail'] = wikiObj;
            }
            return data;
        }
        else {
            return res;
        }
    },
    async getDetail(name) {
        const listInfo = await this.getInfo(name);
        if(listInfo.state === 'success' ){
            const data = listInfo.detail;
            if(name === data.title)
                data['screenshot'] = await puppeteerUtil(data.title);
            return data;
        } else {
            return listInfo;
        }
    },
    async getHtmlText(name) {
        const listInfo = await this.getInfo(name);
        if(listInfo.state === 'success' ){
            const data = listInfo.detail;
            const detailObj = await wikiHtml(data.url);
            if(detailObj.state === 'success')
            {
                data['html'] = elementsToText(detailObj.data.text)
            } else {
                data['html'] = "error";
            }
            return data;
        } else {
            return listInfo;
        }
    },
    robotFormatStr: async function (name) {
        const apiData = await this.getInfo(name,1,6);
        let res = '';
        if(apiData.detail){
            res += ('为你找到:'+ apiData.detail.title +':\n\t'+apiData.detail.result+'\n'+apiData.detail.url+'\n');

            res += '你可能还需要找:';
            apiData.wiki.filter( item => {
                return item.title !== name;
            }).forEach(value => {
                res += '\n'+value.title
            });
        } else {
            res += ('未找到:'+name+' !\n请重新确认!')
        }

        return res;
    }
};

function getListUrl(name,page,size){
    const offset = (page - 1) * size;
    const search = encodeURIComponent(name);
    return 'https://warframe.huijiwiki.com/index.php?title=%E7%89%B9%E6%AE%8A:%E6%90%9C%E7%B4%A2&limit='+size+'&offset='+offset+'&profile=default&search='+search;
}
function getDetailUrl(url){
    return 'https://warframe.huijiwiki.com'+url;
}
function wikiHtml(wikiUrl){
    const req = superagent
        .get(wikiUrl)
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
        // .set('Content-Type', 'application/x-www-form-urlencoded')
        .then(res => ({
            state: 'success',
            data: res
        })).catch(err => ({
            state: 'error',
            data: err
        }));
    if(propxyConfig.config)
        req.proxy(propxyConfig.config);
    return req;
}
function elementsToText(text){
    const $ = cheerio.load(text);
    $('.mw-parser-output > table').last().remove();
    $('.mw-parser-output > div').attr('style','width:100%;text-align:center;').remove();
    return $('.mw-parser-output').first().text();//.replace(/[\n\t]+/g,'\n');
}
function elementsToList(text){
    const wikiList = [];
    const $ = cheerio.load(text);
    const total = parseInt($('.results-info').attr('data-mw-num-results-total'));
    $('.mw-search-results').find('li').each((index,value)=>{
        const e = $(value);
        const heading = e.find('.mw-search-result-heading > a');
        const result = e.find('.searchresult');
        const result_data = e.find('.mw-search-result-data');
        const wiki = {
            url: getDetailUrl(heading.attr('href')),
            title: heading.attr('title'),
            result: result.text(),
            result_data: result_data.text()
        };
        wikiList.push(wiki);
    });
    return {
        wikiList: wikiList,
        total: total
    };
}
module.exports = huijiwiki;
