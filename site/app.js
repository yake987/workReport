var express = require('express');
var ejs = require('ejs');
var mongoose = require('mongoose');
var session = require('express-session')
var dbOptions = {
    'user': 'admin',
    'pass': 'admin'
};
// mongoose.connect('mongodb://admin:admin@ds029317.mongolab.com:29317/winqr');
mongoose.connect('mongodb://127.0.0.1:27017/weekly_report');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('port', process.env.PORT || 8088);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(multer()); // for parsing multipart/form-data
var init = require('./routes');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// 中间件配置
init(app);

app.use(function(req, res) {
    res.status(404);
    res.render('404', {
        title: '404页面'
    });
});
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500);
    res.render('500', {
        title: '500页面'
    });
});
app.listen(app.get('port'), function() {
    console.log('express started on http:localhost:' +
        app.get('port') + ';press Ctrl+C to terminate.');
});

//获取天气数据
function getWeatherData() {
        return {
            locations: [{
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            }, {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            }, {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            }, ],
        };
    }
    /**
     * [返回一个范围数组 从s到l递增或递减的数组]
     * @param  {number} s [description]
     * @param  {number} l [description]
     * @return {Array}   [description]
     */
function rangeArray(s, l) {
    var rangeArr = [];
    if (s == l) {
        rangeArr.push(s);
    } else if (s < l) {
        for (var i = s; i <= l; i++) {
            rangeArr.push(i);
        }
    } else {
        for (var j = s; j >= l; j--) {
            rangeArr.push(j);
        }
    }
    return rangeArr;
}


module.exports = app;