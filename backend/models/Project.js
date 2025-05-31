const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectName: String,
  projectGoal: String,
  startDate: String, 
  endDate: String,
  expectedTimeline: String,
  meetingNotes: String,
}, { timestamps: true });  // 啟用自動管理 createdAt 和 updatedAt

module.exports = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
