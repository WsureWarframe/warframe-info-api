const retry = require('./index')
const logger = require('../logger')(__filename)

let getData = (index) => {
    return new Promise(((resolve, reject) => {
        if(index >0){
            logger.info('getData reject(), index:' + index)
            reject()
        } else {
            logger.info('getData resolve(), index:' + index)
            resolve()
        }
    }))
}
let count = 5;
retry( () => getData(count--),{times : 10, delay: 1000,onRetry: (data)=>{
        logger.info('onRetry',data)
    }
}).then(res => {
    logger.info('then',res)
}).catch( error => {
    logger.info('catch',error)
}).finally( () => {
    logger.info('finally')
})
