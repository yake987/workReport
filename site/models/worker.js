var mongoose = require('mongoose');

var workerSchema = mongoose.Schema({
  name: String, //工作者name
  passWord: String,    //密码
  email: String,    //密码
  mobile: String,    //密码
  QQ: String,    //qq
  leaderId: String,    //上级id
  position: String,    //职位
  addTime: String,   //添加时间
  remark: String     //备注
});
var Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;