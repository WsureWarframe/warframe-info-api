const puppeteer = require('puppeteer');
const init = require('../../utils/init')
class Chroium {
    constructor(browser) {
        // console.log(init)
        this.browser = browser;
    }
    static async getInstance() {
        if (!Chroium.instance) {
            // console.log(init)
            // init.readEndpoint().then( res => console.log(res)).catch( err => console.error(err));
            // if(wsEndpoint){
            //     Chroium.instance = new Chroium(await puppeteer.connect({browserWSEndpoint: wsEndpoint.toString()}))
            // } else {
            //     Chroium.instance = new Chroium( await puppeteer.launch({ignoreHTTPSErrors: true, headless: true, args: ['--no-sandbox']}))
            //     await init.saveEndpoint(Chroium.instance.browser.wsEndpoint())
            // }
            Chroium.instance = new Chroium( await puppeteer.launch({ignoreHTTPSErrors: true, headless: true, args: ['--no-sandbox']}))
        }
        return Chroium.instance;
    }
    static async getBrowser(){
        return (await Chroium.getInstance()).browser
    }
}

module.exports = Chroium;