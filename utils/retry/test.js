const retry = require('./index')

let getData = (index) => {
    return new Promise(((resolve, reject) => {
        if(index >0){
            console.log('getData reject(), index:' + index)
            reject()
        } else {
            console.log('getData resolve(), index:' + index)
            resolve()
        }
    }))
}
let count = 5;
retry( () => getData(count--),{times : 10, delay: 1000,onRetry: (data)=>{
        console.log('onRetry',data)
    }
}).then(res => {
    console.log('then',res)
}).catch( error => {
    console.log('catch',error)
}).finally( () => {
    console.log('finally')
})
