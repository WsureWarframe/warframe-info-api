const superagent = require('superagent');
require('superagent-proxy')(superagent);
const puppeteer = require('puppeteer');

/* GET users listing. */
const init = {
    getPageStorage : async (url)=>{
        //'https://wfa.richasy.cn/'
        const browser = await puppeteer.launch({args:['--no-sandbox']})
        const page = await browser.newPage()
        await page.goto(url)
        const returnedCookie = await page.cookies();
        console.log(`${url} - cookies - ${returnedCookie}`)

        await page.waitForTimeout( 10000 );
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
