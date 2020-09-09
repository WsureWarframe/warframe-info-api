const mcache = require('memory-cache');
const superagent = require('superagent');
require('superagent-proxy')(superagent);
const puppeteer = require('puppeteer');

/* GET users listing. */
const init = {
    proxy: 'http://127.0.0.1:8888',
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
            .then(final);
    },
    loadPage: async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage()
        await page.goto('https://riven.richasy.cn/')
        const localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
        console.log(localStorage);
        await browser.close();
    },
    getPageStorage : async (url)=>{
        //'https://wfa.richasy.cn/'
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url)
        const returnedCookie = await page.cookies();
        console.log(`${url} - cookies - ${returnedCookie}`)

        await page.waitFor( 10000 );
        const localStorageData = await page.evaluate(() => {
            let json = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                json[key] = localStorage.getItem(key);
            }
            return json;
        });
        console.log(`${url} - localStorage - ${Object.keys(localStorageData)}`)

        await browser.close()
        return {
            cookies: returnedCookie,
            storage: localStorageData
        }
    }
};

module.exports = init;
