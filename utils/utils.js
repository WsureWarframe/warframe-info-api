var moment = require('moment');
//require 方式
require('moment/locale/zh-cn');
moment.locale('zh-cn');
utils = {
  apiTimeUtil:function (str) {
    var time =  moment(str).toDate().toLocaleString();
    return time;
  }
};

module.exports = utils;