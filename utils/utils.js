var moment = require('moment');
//require 方式
require('moment/locale/zh-cn');
moment.locale('zh-cn');
utils = {
  apiTimeUtil:function (str) {
    var time = moment(str);
    return {
      localTime:time.toDate().toLocaleString(),
      fromNow:time.fromNow(),
      toNow:time.toNow(),
      diff:timeDiff(moment(),time)
    };
  },
  timeDiff:function (t1,t2) {
    return timeDiff(t1?moment(t1):moment(),t2?moment(t2):moment());
  },
  eta:function (str) {
    return str
        .replace(/ /g,'')
        .replace(/d/g,'天')
        .replace(/h/g,'小时')
        .replace(/m/g,'分')
        .replace(/s/g,'秒')
        ;
  },
  testType:function (type) {
    if(type === 'Ostrons'||type === 'Solaris'){
      return 'syndicateMissions';
    }
    return type;
  },
    formatter:function (string) {
        return string.toString().toUpperCase().replace(/\s/g,'')
    },
    getAcc:function(key,word,thick){
      var acc = key.length/word.length;
      var thick_ = key.length/(thick[thick.length-1] -thick[0]===0?1:(thick[thick.length-1] -thick[0]));
      var head = word.indexOf(key)===0?1:0;
      var set = word.indexOf('一套')>-1?1:0;
      var prime = word.indexOf('PRIME')>-1?1:0;
      var result = acc * 0.15 + thick_ * 0.2 + head * 0.2 + set * 0.1 + 0.05 * prime;
      // console.log('key:'+key+' word:'+word+' acc'+acc+' thick'+thick_+' head:'+head+' result:'+result);
      return result;
    },
    comparison:function (key_,word_) {
      var key = this.formatter(key_);
      var word = this.formatter(word_);
      //查询词
      var keyA = key.split('');
      //词库里的词
      var wordA = word.split('');
      var i = 0,len = 0,thick = [];
      keyA.forEach((value, index, array) => {
          wloop:for(var j = i;j<wordA.length;j++){
              if(value === wordA[j]){
                  thick.push(j);
                  i =j;
                  len++;
                  break wloop;
              }
          }
      });
      var state = len===keyA.length;
      return state?{state:state,acc:this.getAcc(key,word,thick),key:word_}:{state:state,key:word};
    },
    getSaleWord:function (key,words) {
        var res = [];
        words.forEach((value)=>{
            var obj = this.comparison(key,value);
            if(obj.state){
                res.push(obj);
            }
        });
        var resSort = res.sort(function(a, b) {

            return b.acc - a.acc;
        });
        return resSort.slice(0,11);
    }
};

function timeDiff(t1,t2) {
  var prefix = t2.diff(t1)>0?'还剩余':'已过去';
  return prefix+millisecondToString(Math.abs(t2.diff(t1)));
}

function millisecondToString(mss = 0){
  const days = parseInt(mss / (1000 * 60 * 60 * 24));
  const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = parseInt((mss % (1000 * 60)) / 1000);
  return (days === 0 ? '':days+'天' )+
      (hours === 0 ? '':hours+'小时' )+
      (minutes === 0 ? '':minutes+'分' )+
      (seconds === 0 ? '':seconds+'秒' );
}

module.exports = utils;
