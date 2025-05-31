const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  reason: { type: String, required: true },  // 這欄直接存所有理由（包含自訂）
  againId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 新增的欄位，代表被反饋有問題的項目的ID
  timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("feedback", FeedbackSchema);

module.exports = Feedback;
