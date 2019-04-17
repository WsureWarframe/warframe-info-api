var mcache = require('memory-cache');
var superagent = require('superagent');
require('superagent-proxy')(superagent);

/* GET users listing. */
var init ={
    proxy : 'http://127.0.0.1:8888',
    libsArr : ['dict','sale','riven','nightwave','invasion'],
    initToken : function(success,fail){
        if(mcache.get("token"))
        {
            success(mcache.get("token"))

        } else {
            var url =  'http://api.richasy.cn/connect/token';
            var params = 'client_id=eadfa670ed114c7dbcaecb1a3a1f5fac&client_secret=2bdaaf0e90bd4e8784788d86eb8bca12&grant_type=client_credentials';
            var reqData = {
                'client_id': 'eadfa670ed114c7dbcaecb1a3a1f5fac',
                'client_secret': '2bdaaf0e90bd4e8784788d86eb8bca12',
                'grant_type': 'client_credentials'
            };
            var headers= {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
                'Referer': 'http://wfa.richasy.cn/'
            };
            superagent
                .post(url)
                .proxy(this.proxy)
                .send(params)
                .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
                .set('Referer','http://wfa.richasy.cn/')
                .then(res=>{
                    if(res.body.error)
                    {
                        fail();
                        return;
                    }
                    console.log(res.body);
                    var body = res.body;
                    var token = body.token_type+' '+body.access_token;
                    mcache.put("token",token,body.expires_in);
                    success(body.token_type+' '+body.access_token);
                }).catch(err=>{
                console.log(err);
                fail();
            })
        }
    },
    getLib:function (libName, success, fail) {
        if(mcache.get("lib_"+libName))
        {
            success(mcache.get("lib_"+libName));
            return;
        }
        var url = 'http://api.richasy.cn/wfa/lib/all/'+libName;
        superagent
            .get(url)
            .proxy(this.proxy)
            .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36')
            .set('Referer','http://wfa.richasy.cn/')
            .set('Authorization',mcache.get("token"))
            .then(res=>{
                console.log("lib_"+libName);
                console.log(res.body.length);
                mcache.put("lib_"+libName,res.body);
                success(res.body);
        }).catch(err=>{
            fail(err);
        })
    },
    initLibs(complete){
        var result = {};
        var that = this;
        let async=(data)=>new Promise((resolve,reject)=>{
            that.getLib(that.libsArr[data],function (libRes) {
                result[that.libsArr[data]] =  libRes;
                return resolve(data+1);
            },function (libErr) {
                result[that.libsArr[data]] =  libErr;
                return resolve(data+1);
            })
        });
        let final=value=>{
            console.log('完成: ', Object.keys(result));
            complete(result);
        };
        async(0)
            .then(async)
            .then(async)
            .then(async)
            .then(async)
            .then(final);
    }
};

module.exports = init;
