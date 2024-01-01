const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const init = require('./service/init')
const utils = require('./utils/utils')
const Fingerprint = require('express-fingerprint')

const indexRouter = require('./routes/index');
const mpRouter = require('./routes/mp');
const warframe = require('./routes/warframe');
const wm = require('./routes/warframeMarket');
const rm = require('./routes/rivenMarket');
const wiki = require('./routes/huijiwiki');
const dict = require('./routes/dict');
const robot = require('./routes/robot');
const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use( require('request-param')({ order: ["body","params","query"] } ) )
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(Fingerprint( {
  parameters:[
    // Defaults
    Fingerprint.useragent,
    Fingerprint.acceptHeaders,
    Fingerprint.geoip
  ]
}))
app.use((req, res, next) => {
  utils.recordCustomer(req)
  next()
})
app.use(express.static(path.join(__dirname, 'public')));
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

//启动时任务
init.onstart().then(() =>{
  app.use('/', indexRouter);
  app.use('/mp', mpRouter);
  app.use('/wf', warframe);
  app.use('/wm', wm);
  app.use('/rm', rm);
  app.use('/wiki', wiki);
  app.use('/dict', dict);
  app.use('/robot', robot);
// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });
  app.all("*",function (req,res,next){
    //设置允许跨域的域名，*代表允许任意域名跨域
    res.header("Access-Control-Allow-Origin","*");
    //允许的header类型
    res.header("Access-Control-Allow-Headers","content-type");
    //跨域允许的请求方式
    res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() === 'options')
      res.send(200);  //让options尝试请求快速结束
    else
      next();
  })

})




module.exports = app;
