//微信小程序AppId
const mpAppId = '你的小程序AppId';
const mpAppSecret = '你的小程序Secret';
//QQ小程序AppId
const qqAppId = '你的小程序AppId';
const qqAppSecret = '你的小程序Secret';

mpConfig = {
    weixin:{
        appId:mpAppId,
        appSecret:mpAppSecret
    },
    qq:{
        appId:qqAppId,
        appSecret:qqAppSecret
    }
};
module.exports = mpConfig;
