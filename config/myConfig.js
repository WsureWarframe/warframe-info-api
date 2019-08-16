//调试开关 ，目前貌似没用
const MY_DEV = true;
//中文词库配置 true为使用本地词库 false为启动时抓取wfa的词库
const LOCAL_LIB = true;
//https配置 如果使用Https，请手动修改./bin/www 内配置的证书，不用请
const USE_HTTPS = false;
myConfig = {
    localLib:LOCAL_LIB,
    isDev:MY_DEV,
    https:USE_HTTPS
};
module.exports = myConfig;
