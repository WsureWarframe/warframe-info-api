const USE_PROXY = true;
const PROXY_CONFIG = 'http://127.0.0.1:1081';
proxyConfig = {
    enabled:USE_PROXY,
    proxy:PROXY_CONFIG,
    config:USE_PROXY?PROXY_CONFIG:null
};
module.exports = proxyConfig;