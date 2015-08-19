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



module.exports = app;