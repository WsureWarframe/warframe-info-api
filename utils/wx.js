var mpConfig = require('../config/mpConfig');
var superagent = require('superagent');
var propxyConfig = require('../config/proxyConfig');
require('superagent-proxy')(superagent);

wxUtils = {
    wxLogin:wxLogin
};

function wxLogin(code){
    var wxLoginUrl = 'https://api.weixin.qq.com/sns/jscode2session?appid='+mpConfig.mpAppId+'&secret='+mpConfig.mpAppSecret+'&grant_type=authorization_code&js_code='+code;
    console.log(wxLoginUrl);
    return new Promise((resolve,reject)=>{
        superagent
            .get(wxLoginUrl)
            .proxy(propxyConfig.config)
            //.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
            .then(res=>{
                var data = res.data?res.data:JSON.parse(res.text);
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

module.exports = wxUtils;
