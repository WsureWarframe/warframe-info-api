const mpConfig = require('../config/mpConfig');
const superagent = require('superagent');
const proxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);

mpUtils = {
    mpLogin:mpLogin
};

function mpLogin(code,platform = 'weixin'){
    const code2Session = {
        weixin: 'https://api.weixin.qq.com/sns/jscode2session',
        qq: 'https://api.q.qq.com/sns/jscode2session'
    };
    const mpLoginUrl = code2Session[platform] + '?appid=' + mpConfig[platform].appId + '&secret=' + mpConfig[platform].appSecret + '&grant_type=authorization_code&js_code=' + code;
    console.log(mpLoginUrl);
    return new Promise((resolve,reject)=>{
        superagent
            .get(mpLoginUrl)
            .proxy(proxyConfig.config)
            //.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
            .then(res=>{
                const data = res.data ? res.data : JSON.parse(res.text);
                if(data.errcode){
                    reject({
                        state:false,
                        data:data
                    })
                } else {
                    resolve({
                        state:true,
                        data:data
                    })
                }
            }).catch(err=>{
                reject({
                    state:false,
                    data:err
                })
        })
    })



}

module.exports = mpUtils;
