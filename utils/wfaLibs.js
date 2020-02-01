const mcache = require('memory-cache');
const superagent = require('superagent');
const propxyConfig = require('../config/proxyConfig');
const localLib = require('../utils/localLibs');
const localRivenData = require('../utils/localRivenData');
require('superagent-proxy')(superagent);

const libs = {
    dict: new mcache.Cache(),
    sale: new mcache.Cache(),
    riven: new mcache.Cache(),
    nightwave: new mcache.Cache(),
    invasion: new mcache.Cache(),
    wm: new mcache.Cache(),
    rm: new mcache.Cache(),
    /* riven weapon */
    rw: new mcache.Cache()
};
/* GET users listing. */
const wfaLibs = {
    mcache: mcache,
    libs: libs,
    proxy: propxyConfig.config,
    libsArr: ['dict', 'sale', 'riven', 'nightwave', 'invasion'],
    initToken: function (success, fail) {
        if (mcache.get("token")) {
            success(mcache.get("token"))
        } else {
            const url = 'http://api.richasy.cn/connect/token';
            const params = 'client_id=eadfa670ed114c7dbcaecb1a3a1f5fac&client_secret=2bdaaf0e90bd4e8784788d86eb8bca12&grant_type=client_credentials';
            const reqData = {
                'client_id': 'eadfa670ed114c7dbcaecb1a3a1f5fac',
                'client_secret': '2bdaaf0e90bd4e8784788d86eb8bca12',
                'grant_type': 'client_credentials'
            };
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
                'Referer': 'http://wfa.richasy.cn/'
            };
            console.log(propxyConfig);
            superagent
                .post(url)
                .proxy(this.proxy)
                .send(params)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
                .set('Referer', 'http://wfa.richasy.cn/')
                .then(res => {
                    if (res.body.error) {
                        fail();
                        return;
                    }
                    console.log(res.body);
                    const body = res.body;
                    const token = body.token_type + ' ' + body.access_token;
                    mcache.put("token", token, body.expires_in);
                    success(body.token_type + ' ' + body.access_token);
                }).catch(err => {
                console.log(err);
                fail();
            })
        }
    },
    getLib: function (libName, success, fail) {
        if (mcache.get("lib_" + libName)) {
            success(mcache.get("lib_" + libName));
            return;
        }
        const url = 'http://api.richasy.cn/wfa/lib/all/' + libName;
        superagent
            .get(url)
            .proxy(this.proxy)
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
            .set('Referer', 'http://wfa.richasy.cn/')
            .set('Authorization', mcache.get("token"))
            .then(res => {
                console.log("lib_" + libName);
                console.log(res.body.length);
                mcache.put("lib_" + libName, res.body);
                success(res.body);
            }).catch(err => {
            fail(err);
        })
    },
    getRivenMarketData:(that)=> {

        const RMHost = 'https://riven.market';

        return new Promise(async (resolve, reject) => {
            const RMRes = await utils.getRequest(RMHost + '/list/PC');
            if (RMRes.text !== '') {
                const RMDataUrl = RMRes.text.match(/(?<=src=").+warframeData.+?(?=")/).join();
                const RMData = await utils.getRequest(RMHost + RMDataUrl);
                if (RMData.text !== '') {
                    const Module = require('module');
                    const rivenData = new Module("riven-data");
                    rivenData._compile(`${RMData.text}
                    module.exports = { statsData : statsData ,weaponData : weaponData };`, 'riven-data');
                    that.initRWCache(rivenData.exports.weaponData);
                    console.log(`riven-data create success`);
                    resolve();
                }
            }
            reject();
        });
    },
    initLibs(complete) {
        const result = {};
        const that = this;
        let async = (data) => new Promise((resolve, reject) => {
            that.getLib(that.libsArr[data], function (libRes) {
                result[that.libsArr[data]] = libRes;
                return resolve(data + 1);
            }, function (libErr) {
                result[that.libsArr[data]] = libErr;
                return resolve(data + 1);
            })
        });
        let final = value => {
            console.log('完成: ', Object.keys(result));
            complete(result);
        };
        async(0)
            .then(async)
            .then(async)
            .then(async)
            .then(async)
            .then(this.getRivenMarketData(that))
            .then(final);
    },
    initRWCache(rivenData){
        let that = this;
        Object.keys(rivenData).forEach(type =>{
            Object.keys(rivenData[type]).forEach(weapon=>{
                that.libs.rw.put(weapon.replace(/_/g,' '),rivenData[type][weapon]);
            })
        });
        console.log("rw:"+ that.libs.rw.size());
    },
    initLibsCache() {
        const that = this;
        this.libsArr.forEach(function (value, index, array) {
            // that.libs[value].put(value,index);
            // console.log(value,that.libs[value].get(value))
            if (value === 'sale') {
                that.mcache.get('lib_' + value).forEach(function (value_, index_) {
                    that.libs['wm'].put(value_.en, value_);
                    value_.en !== value_.zh && that.libs['wm'].put(value_.zh, value_);
                });
            }

            if(value === 'dict'){
                that.mcache.get('lib_' + value).filter(item=> item.type === 'Weapon' && that.libs['rw'].get(item.en)!=null ).forEach(function (value_, index_) {
                    that.libs['rm'].put(value_.en, value_);
                    value_.en !== value_.zh && that.libs['rm'].put(value_.zh, value_);
                    that.libs.rw.del(value_.en);
                });
            }

            that.mcache.get('lib_' + value).forEach(function (value_, index_) {
                that.libs[value].put(value_.en, value_);
            })
        });

        console.log("rw :"+that.libs.rw.size()+" rm: "+that.libs.rm.size())
        console.log(that.libs.rw.keys().join(','))
    },
    initLocalLib() {
        const vm = this;
        this.libsArr.forEach(function (value) {
            vm.mcache.put('lib_' + value, localLib[value])
        })
    },
    initLocalRW(){
        this.initRWCache(localRivenData.weaponData);
    }
};

module.exports = wfaLibs;
