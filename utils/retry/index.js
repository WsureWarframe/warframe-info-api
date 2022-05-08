const logger = require('../logger')(__filename)
const utils = require('../utils')
/*
retry(function (){},{
    times: 3,
    //每次延迟
    delay: 1000,
    //每次延迟增量
    increment: 1000,
    shouldRetry: (err,opts) => {
        //判断是否应该继续
        return true;
    },
    onRetry: (data) => {
        //收集error和次数信息
    }
})
    .then(data => logger.info(data))
    .catch(err => logger.info(err));
*/

//then链实现
function retry(promiseGen,name = '',opts = {
    times: 3, delay: 3000, onRetry: (data) => {
        logger.info('onRetry',{message:data} )
        logger.info(`${name} => 获取失败，等待重试`)
    }
}){
    return promiseGen().catch(err => {
        if(opts.shouldRetry && !opts.shouldRetry(err,opts)) return Promise.reject(err);
        if(opts.times-- < 1) return Promise.reject(err);
        let starter = opts.delay ? utils.delay(opts.delay) : Promise.resolve();

        return starter.then((res) => {
            if(opts.onRetry) opts.onRetry({err,times:opts.times});
            opts.delay += opts.increment || 0;

            return retry(promiseGen,opts);
        })
    })
}
module.exports = retry;
