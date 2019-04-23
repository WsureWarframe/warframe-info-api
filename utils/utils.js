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