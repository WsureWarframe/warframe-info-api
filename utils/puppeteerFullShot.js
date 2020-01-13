const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const getScreenshot  = async (name) => {
    const hasError = false;
    const img_path = '/screenshot/'+name+'.png';
    try {
        const res = await isFileExisted(name);
        console.log(name,res);
        if(res === 'existed')
        {
            return img_path;
        }
    } catch(error){
        console.log(error);
    }
    // 启动Chromium
    const browser = await puppeteer.launch({ignoreHTTPSErrors: true, headless:true, args: ['--no-sandbox']});
    // 打开新页面
    const page = await browser.newPage();
    // 设置页面分辨率
    await page.setViewport({width: 1080, height: 720});

    let request_url = getReqUrl(name);
    // 访问
    await page.goto(request_url, {waitUntil: 'domcontentloaded'}).catch(err => console.log(err));
    await page.waitFor(1000);
    // let title = await page.title();
    // console.log(title);

    // 网页加载最大高度
    const max_height_px = 20000;
    // 滚动高度
    let scrollStep = 720;
    let height_limit = false;
    let mValues = {'scrollEnable': true, 'height_limit': height_limit};

    while (mValues.scrollEnable) {
        mValues = await page.evaluate((scrollStep, max_height_px, height_limit) => {

            // 防止网页没有body时，滚动报错
            if (document.scrollingElement) {
                let scrollTop = document.scrollingElement.scrollTop;
                document.scrollingElement.scrollTop = scrollTop + scrollStep;

                if (null != document.body && document.body.clientHeight > max_height_px) {
                    height_limit = true;
                } else if (document.scrollingElement.scrollTop + scrollStep > max_height_px) {
                    height_limit = true;
                }

                let scrollEnableFlag = false;
                if (null != document.body) {
                    scrollEnableFlag = document.body.clientHeight > scrollTop + (scrollStep+1) && !height_limit;
                } else {
                    scrollEnableFlag = document.scrollingElement.scrollTop + scrollStep > scrollTop + (scrollStep+1) && !height_limit;
                }
                return {
                    'scrollEnable': scrollEnableFlag,
                    'height_limit': height_limit,
                    'document_scrolling_Element_scrollTop': document.scrollingElement.scrollTop
                };
            }

        }, scrollStep, max_height_px, height_limit);

        await sleep(800);
    }
    try {
        await page.screenshot({path: path.join(__dirname, "../public"+img_path), fullPage:true}).catch(err => {
            console.log('截图失败');
            console.log(err);
            hasError = true;
        });
        await page.waitFor(5000);
        return hasError?'error':img_path;
    } catch (e) {
        console.log('执行异常');
        return 'error';
    } finally {
        await browser.close();
    }
};

//延时函数
function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(1)
            } catch (e) {
                reject(0)
            }
        }, delay)
    })
}
function getReqUrl(name) {
    return 'http://warframe.huijiwiki.com/index.php?search='+encodeURIComponent(name);
}

function hasScreenshot(name){
    const fileName = '../public/screenshot/'+name+'.png';
    fs.exists(fileName, function(exists) {
        console.log(exists ? "创建成功" : "创建失败");
    });
}

function isFileExisted(name) {
    const fileName = path.join(__dirname, '../public/screenshot/'+name+'.png');
    return new Promise(function(resolve, reject) {
        fs.access(fileName, (err) => {
            if (err) {
                reject(err.message);
            } else {
                resolve('existed');
            }
        })
    })
}

module.exports = getScreenshot;
