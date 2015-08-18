var mongoose = require('mongoose');

var workReportSchema = mongoose.Schema({
  jobContent: String, //任务（工作内容）
  planTime: String,    //预计完成时间
  finishTime: String,  //实际完成时间
  workerId: String ,    //工作者_id
  progress: String ,    //进度
  remark: String ,    //备注
  addTime: String    //记录添加时间
});
var WorkReport = mongoose.model('WorkReport', workReportSchema);

module.exports = WorkReport;