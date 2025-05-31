const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  mbtiType: { type: String, required: true },
  skills: { type: [String], default: [] }, // ✅ 改為物件格式
  preferences: {
    projectType: { type: [String], default: [] } // ✅ 同上
  },
  availability: { type: Boolean, default: true }
}, {
  timestamps: true
});

delete mongoose.connection.models['Employee']; // 保險：熱重啟時清除快取
module.exports = mongoose.model('Employee', employeeSchema);
