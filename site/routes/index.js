var Worker = require('../models/worker.js');
var WorkReport = require('../models/workReport.js');
var async = require('async');
var xlsx = require('node-xlsx');
var dateFormat = require('dateFormat');

// 初始化管理员账号
Worker.find(function(err, workers) {
    if (workers.length) return;
    new Worker({
        name: '管理员', //
        passWord: '123456', //密码
        email: 'winqr@winqr.com', //email
        addTime: '2015-08-14', //添加时间
        remark: '' //备注
    }).save();
});

function init(app) {

    app.get('/demo', function(req, res) {
        res.render('demo', {
            reason: ''
        });
    });
    //登录页面
    app.get('/', function(req, res) {
        res.render('index', {
            reason: '',
            email: '',
            pwd: ''
        });
    });
    app.get('/login', function(req, res) {
        res.render('index', {
            reason: '',
            email: '',
            pwd: ''
        });
    });

    app.get('/index.html', function(req, res) {
        res.render('index', {
            reason: '',
            email: '',
            pwd: ''
        });
    });

    //用户登录
    app.post('/login', function(req, res) {
        var where = {};
        where.email = req.body.email || null;
        where.passWord = req.body.passWord || '';
        if (where.email && where.passWord) {
            Worker.findOne(where, function(error, doc) {
                if (error) {
                    res.status(500).json({
                        success: false,
                        error: error
                    });
                } else {
                    if (doc) {
                        console.log(doc);
                        req.session.user = doc;
                        req.session.name = doc.name;
                        if (doc.name == '管理员') {
                            res.render('admin-index', {

                            });
                        } else {
                            res.render('user-index', {

                            });
                        }

                    } else {
                        res.render('index', {
                            reason: '邮箱或密码不正确!',
                            email: where.email,
                            pwd: where.passWord
                        });
                    }

                }

            });

        } else {
            res.render('index', {
                reason: '邮箱或密码不正确!',
                email: where.email,
                pwd: where.passWord
            });
            // res.json(400, {
            //     success: false,
            //     reason: '邮箱或密码不正确!'
            // });
        }

    });

    //用户退出或注销
    app.get('/out', function(req, res) {
        if (req.session.user) {
            req.session.user = null;
        }
        res.render('index', {
            reason: '',
            email: '',
            pwd: ''
        });

    });

    app.use(isLogin);

    app.get('/add-user.html', function(req, res) {
        res.render('add-user', {
            reason: ''
        });
    });

    app.get('/user-info.html', function(req, res) {
        res.render('user-info', {
            user: req.session.user,
            reason: ''
        });
    });

    app.post('/user-info.html', function(req, res) {

        var obj = {};
        obj.name = req.body.name ? req.body.name.toString().trim() : '';
        obj.email = req.body.email ? req.body.email.toString().trim() : '';
        obj.QQ = req.body.QQ ? req.body.QQ.toString().trim() : '';
        obj.mobile = req.body.mobile ? req.body.mobile.toString().trim() : '';
        obj.passWord = req.body.passWord ? req.body.passWord.toString().trim() : '';
        obj.remark = req.body.remark ? req.body.remark.toString().trim() : '';

        if (!obj.passWord) {
            res.render('user-info', {
                user: obj,
                reason: '密码不能为空!'
            });
        } else {
            Worker.update({
                name: obj.name,
                email: obj.email
            }, {
                $set: {
                    QQ: obj.QQ,
                    mobile: obj.mobile,
                    passWord: obj.passWord,
                    remark: obj.remark
                }
            }, function(err, info) {
                 if(err){
                      res.render('500', {
                                reason: '系统繁忙!'
                            });
                 }else if (info) {
                    req.session.user.QQ=obj.QQ;
                    req.session.user.mobile=obj.mobile;
                    req.session.user.passWord=obj.passWord;
                    req.session.user.remark=obj.remark;
                    res.render('user-info', {
                        user: obj,
                        reason: '用户资料修改成功!'
                    });
                } else {
                    console.log(2,info);
                    res.render('500', {
                                reason: '系统繁忙!'
                            });
                }
            });
        }

    });


    // 查询所有用户
    app.get('/all-user.html', getAllUserInfo);
    //转到用户页面
    app.get('/admin-form.html', function(req, res) {
        res.render('admin-form');
    });
    //转到admin Welcome页面
    app.get('/admin-index.html', function(req, res) {
        res.render('admin-index');
    });
    // 管理员查询所有周报
    app.get('/admin-table.html', getWorkReport);

    // 用户查询所有周报
    app.get('/user-table.html', getAUserWorkReport);


    app.get('/user-index.html', function(req, res) {
        res.render('user-index');
    });

    app.get('/user-form.html', function(req, res) {
        if (req.session.user) {
            res.render('user-form', {
                name: req.session.user.name,
                workerId: req.session.user._id,
                reason: ''
            });
        } else {
            res.render('index', {
                reason: '',
                email: '',
                pwd: ''
            });
        }

    });

    // 添加用户
    app.post('/add-user.html', function(req, res) {
        var obj = {};
        obj.name = req.body.name ? req.body.name.toString().trim() : '';
        obj.email = req.body.email ? req.body.email.toString().trim() : '';
        obj.QQ = req.body.QQ ? req.body.QQ.toString().trim() : '';
        obj.mobile = req.body.mobile ? req.body.mobile.toString().trim() : '';
        obj.passWord = obj.mobile ? obj.mobile : '123456';
        obj.remark = req.body.remark ? req.body.remark.toString().trim() : '';
        obj.addTime = dateFormat(new Date(), 'yyyy-mm-dd');

        if (!obj.name || !obj.email) {
            res.render('add-user', {
                reason: '姓名和email不能为空!'
            });
        } else {
            Worker.find({
                name: req.body.name
            }, function(err, workers) {
                if (workers.length) {
                    res.render('add-user', {
                        reason: '该用户姓名已存在!'
                    });
                } else {
                    new Worker(obj).save(function(err) {
                        if (err) {
                            res.render('add-user', {
                                reason: '系统繁忙!'
                            });
                        } else {
                            res.render('add-user', {
                                reason: '保存成功!'
                            });
                        }
                    });
                }
            });
        }
    });


    // 查询工作周报
    function getWorkReport(req, res) {
        var where = {};
        var name = req.query.name || ''; //name  
        var startTime = req.query.startTime || ''; //name  
        var endTime = req.query.endTime || ''; //name  
        var pageNumber = req.query.pagenumber || 1; //当前第几页  
        var resultsPerPage = req.query.limit || 15; //每页多少条记录  
        var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage; //跳过多少记录查询

        var errCode = 200;
        var reason = '';
        var total = 0;
        if (name) {
            name = name.toString().trim();
        }
        if (startTime) {
            where.addTime = {
                $gte: startTime.toString().trim()
            };
        }
        if (endTime) {
            where.endTime = {
                $lte: endTime.toString().trim()
            };
        }

        var context = {};
        async.waterfall([
                function errorCheck(callback) {
                    if (name) {

                        Worker.findOne({
                            name: name
                        }, function(err, obj) {
                            if (err) {
                                errCode = 500;
                                callback(errCode);
                            } else {

                                if (obj) {
                                    where.workerId = obj._id;
                                }
                                callback();
                            }

                        });

                    } else {
                        callback();
                    }

                },

                //信息查询
                function appsInfosCheck(callback) {
                    var query = WorkReport.find(where).sort({
                        addTime: -1,
                        workerId: 1
                    }).skip(skipFrom).limit(resultsPerPage);
                    query.exec(function(error, results) {
                        if (error) {
                            errCode = 500;
                            callback(errCode);
                        } else {
                            WorkReport.count(where, function(error, count) {
                                if (error) {
                                    errCode = 500;
                                    callback(errCode);
                                } else {
                                    total = Math.ceil(count / resultsPerPage);
                                    context = {
                                        total: total,
                                        pageNumber: pageNumber,
                                        count: count,
                                        reports: results.map(function(item) {
                                            return {
                                                _id: item._id,
                                                jobContent: item.jobContent,
                                                planTime: item.planTime,
                                                finishTime: item.finishTime,
                                                addTime: item.addTime,
                                                workerId: item.workerId,
                                                remark: item.remark,
                                                progress: item.progress
                                            };
                                        })
                                    };
                                    callback(null);
                                }
                            });
                        }
                    });
                },
                function(callback) {
                    if (Array.isArray(context.reports) && context.reports.length) {
                        async.eachSeries(context.reports, function(item, next) {
                            Worker.findOne({
                                _id: item.workerId
                            }, function(err, result) {
                                if (err) {
                                    errCode = 500;
                                    next(err);
                                } else {
                                    item.name = result.name;
                                    next();
                                }

                            });
                        }, function(err) {
                            callback(err);
                        });
                    } else {
                        callback();
                    }

                }
                // 错误处理
            ],
            function errorProcess(error) {
                // 头

                // 错误处理
                switch (errCode) {
                    case 200:
                        res.render('admin-table', context);

                        break;
                    case 400:
                        res.status(errCode).json(context);
                        break;
                    case 500:
                        res.status(errCode).json(context);
                        break;
                    default:
                        res.end();
                        break;
                }
            });


    }

    function getAUserWorkReport(req, res) {
        var where = {};
        var name = req.query.name || ''; //name  
        var startTime = req.query.startTime || ''; //name  
        var endTime = req.query.endTime || ''; //name  
        var pageNumber = req.query.pagenumber || 1; //当前第几页  
        var resultsPerPage = req.query.limit || 15; //每页多少条记录  
        var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage; //跳过多少记录查询

        var errCode = 200;
        var reason = '';
        var total = 0;
        if (name) {
            name = name.toString().trim();
        }
        if (startTime) {
            where.addTime = {
                $gte: startTime.toString().trim()
            };
        }
        if (endTime) {
            where.endTime = {
                $lte: endTime.toString().trim()
            };
        }

        var context = {};
        async.waterfall([
                function errorCheck(callback) {
                    if (name) {

                        Worker.findOne({
                            name: name
                        }, function(err, obj) {
                            if (err) {
                                errCode = 500;
                                callback(errCode);
                            } else {

                                if (obj) {
                                    where.workerId = obj._id;
                                }
                                callback();
                            }

                        });

                    } else {
                        callback();
                    }

                },

                //信息查询
                function appsInfosCheck(callback) {
                    var query = WorkReport.find(where).sort({
                        addTime: -1,
                        workerId: 1
                    }).skip(skipFrom).limit(resultsPerPage);
                    query.exec(function(error, results) {
                        if (error) {
                            errCode = 500;
                            callback(errCode);
                        } else {
                            WorkReport.count(where, function(error, count) {
                                if (error) {
                                    errCode = 500;
                                    callback(errCode);
                                } else {
                                    total = Math.ceil(count / resultsPerPage);
                                    context = {
                                        total: total,
                                        pageNumber: pageNumber,
                                        name: name,
                                        count: count,
                                        reports: results.map(function(item) {
                                            return {
                                                _id: item._id,
                                                jobContent: item.jobContent,
                                                planTime: item.planTime,
                                                finishTime: item.finishTime,
                                                addTime: item.addTime,
                                                workerId: item.workerId,
                                                remark: item.remark,
                                                progress: item.progress
                                            };
                                        })
                                    };
                                    callback(null);
                                }
                            });
                        }
                    });
                },
                function(callback) {
                    if (Array.isArray(context.reports) && context.reports.length) {
                        async.eachSeries(context.reports, function(item, next) {
                            Worker.findOne({
                                _id: item.workerId
                            }, function(err, result) {
                                if (err) {
                                    errCode = 500;
                                    next(err);
                                } else {
                                    item.name = result.name;
                                    next();
                                }

                            });
                        }, function(err) {
                            callback(err);
                        });
                    } else {
                        callback();
                    }

                }
                // 错误处理
            ],
            function errorProcess(error) {
                // 头

                // 错误处理
                switch (errCode) {
                    case 200:
                        res.render('user-table', context);

                        break;
                    case 400:
                        res.status(errCode).json(context);
                        break;
                    case 500:
                        res.render('500', context);
                        break;
                    default:
                        res.end();
                        break;
                }
            });


    }

    app.post('/addReport', function(req, res) {
        var obj = {};
        obj.jobContent = req.body.jobContent || null;
        obj.planTime = req.body.planTime || '';
        obj.finishTime = req.body.finishTime || '';
        obj.workerId = req.body.workerId || null;
        obj.progress = req.body.progress || null;
        obj.remark = req.body.remark || '';
        obj.addTime = dateFormat(new Date(), 'yyyy-mm-dd');
        if (!req.session.user) {
            res.render('index', {
                reason: '',
                email: '',
                pwd: ''
            });
        } else if (obj.jobContent && obj.workerId) {

            new WorkReport(obj).save(function(error) {
                if (error) {
                    res.render('user-form', {
                        name: req.session.user.name,
                        workerId: req.session.user._id,
                        success: false,
                        reason: error
                    });
                } else {
                    res.render('user-form', {
                        name: req.session.user.name,
                        workerId: req.session.user._id,
                        success: true,
                        reason: '添加成功!'
                    });
                }

            });

        } else {
            res.render('user-form', {
                name: req.session.user.name,
                workerId: req.session.user._id,
                success: false,
                reason: '工作内容和负责人不能为空!'
            });
        }

    });

    app.get('/export', function(req, res) {
        var where = {};
        var winInfo = [];
        var resultsObj = {};
        var xlsxObj = {};
        var pageNumber = req.query.pagenumber || 1; //当前第几页  
        var startTime = req.query.startTime || null; //开始日期 
        var endTime = req.query.endTime || null; //结束日期 
        if (startTime) {
            startTime = startTime.toString().trim();
            where.addTime = {
                $gte: startTime
            };
        }
        if (endTime) {
            endTime = endTime.toString().trim();
            where.addTime = {
                $lte: endTime
            };
        }
        var resultsPerPage = req.query.limit || 100; //每页多少条记录  
        var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage; //跳过多少记录查询
        var query = WorkReport.find(where).skip(skipFrom).sort({
            workerId: -1,
            addTime: 1
        }).limit(resultsPerPage);
        var errCode = 200;
        var reason = '';
        var total = 0;
        var context = {};
        async.waterfall([
                function errorCheck(callback) {
                    // 下一步
                    callback(null);
                },

                //信息查询
                function appsInfosCheck(callback) {
                    query.exec(function(error, results) {
                        if (error) {
                            errCode = 500;
                            callback(errCode);
                        } else {
                            WorkReport.count(where, function(error, count) {
                                if (error) {
                                    errCode = 500;
                                    console.log(1, errCode);
                                    callback(errCode);
                                } else {
                                    total = Math.ceil(count / resultsPerPage);
                                    context = {
                                        reports: results.map(function(problem) {
                                            return {
                                                _id: problem._id,
                                                jobContent: problem.jobContent,
                                                planTime: problem.planTime,
                                                finishTime: problem.finishTime,
                                                addTime: problem.addTime,
                                                workerId: problem.workerId,
                                                remark: problem.remark,
                                                progress: problem.progress
                                            };
                                        })
                                    };
                                    callback(null);
                                }
                            });
                        }
                    });
                },
                function(callback) {
                    if (Array.isArray(context.reports) && context.reports) {
                        async.eachSeries(context.reports, function(item, next) {
                            Worker.findOne({
                                _id: item.workerId
                            }, function(err, result) {
                                if (err) {
                                    errCode = 500;
                                    console.log(2, errCode);
                                    next(err);
                                } else {
                                    item.name = result.name;
                                    next();
                                }

                            });
                        }, function(err) {
                            callback(err);
                        });
                    } else {
                        callback();
                    }
                },
                function(callback) {

                    if (Array.isArray(context.reports) && context.reports) {
                        winInfo = context.reports ? context.reports : [];
                        //map迭代返回数组中每一项调用函数后返回结果组成的数组
                        winInfo = winInfo.map(function(item, index) {
                            return [item.jobContent +
                                '', item.planTime + '',
                                item.finishTime || '', item.name || '', item.progress ||
                                '', item.remark || ''

                            ];

                        });
                        var columnOne = ['任务', '预计完成时间', '实际完成时间', '负责人', '进度', '备注'

                        ];
                        winInfo.unshift(columnOne);
                        try {
                            xlsxObj = xlsx.build({
                                'worksheets': [{
                                    'data': winInfo
                                }]
                            });
                        } catch (ex) {
                            console.log(111, ex);
                            errCode = 500;
                        }
                        callback();
                    } else {
                        callback();
                    }



                }
                // 错误处理
            ],
            function errorProcess(error) {
                // 头
                switch (errCode) {
                    case 200:
                        // 头
                        res.writeHead(errCode, {
                            'Content-Type': 'application/vnd.ms-excel;',
                            'Content-Disposition': 'attachment; filename=' + dateFormat(new Date(), 'yyyy-mm-dd') + 'weeklyReport' + '.xlsx'

                        });
                        res.end(xlsxObj, "binary");
                        break;
                    case 400:
                        // 头
                        res.writeHead(errCode, {
                            'Content-Type': 'text/html'
                        });
                        res.end(JSON.stringify({
                            reason: reason,
                            success: false
                        }));
                        break;
                    case 500:
                        // 头
                        res.writeHead(errCode, {
                            'Content-Type': 'text/html'
                        });
                        res.end(JSON.stringify({
                            reason: '系统繁忙，请重试'
                        }));
                        break;
                    default:
                        res.end();
                        break;
                }

            });
    });

    // 登陆判断
    function isLogin(req, res, next) {
        if (!req.session.user) {
            res.render('index', {
                reason: '',
                email: '',
                pwd: ''
            });
        } else {
            next();
        }
    }

}

function getAllUserInfo(req, res) {
    var where = {};
    var name = req.query.name || ''; //name  

    var pageNumber = req.query.pagenumber || 1; //当前第几页  
    var resultsPerPage = req.query.limit || 15; //每页多少条记录  
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage; //跳过多少记录查询

    var errCode = 200;
    var reason = '';
    var total = 0;
    if (name) {
        name = name.toString().trim();
        where.name = name;
    }

    var context = {};
    async.waterfall([
            //信息查询
            function appsInfosCheck(callback) {
                var query = Worker.find(where).skip(skipFrom).limit(resultsPerPage);
                query.exec(function(error, results) {
                    if (error) {
                        errCode = 500;
                        callback(errCode);
                    } else {
                        Worker.count(where, function(error, count) {
                            if (error) {
                                errCode = 500;
                                callback(errCode);
                            } else {
                                total = Math.ceil(count / resultsPerPage);
                                context = {
                                    total: total,
                                    count: count,
                                    pageNumber: pageNumber,
                                    users: results.map(function(item) {
                                        return {
                                            _id: item._id,
                                            name: item.name,
                                            QQ: item.QQ,
                                            mobile: item.mobile,
                                            addTime: item.addTime,
                                            email: item.email,
                                            remark: item.remark
                                        };
                                    })
                                };
                                callback(null);
                            }
                        });
                    }
                });
            },

            // 错误处理
        ],
        function errorProcess(error) {
            // 头

            // 错误处理
            switch (errCode) {
                case 200:
                    res.render('all-user', context);
                    break;
                case 400:
                    res.status(errCode).json(context);
                    break;
                case 500:
                    res.status(errCode).json(context);
                    break;
                default:
                    res.end();
                    break;
            }
        });


}

module.exports = init;
