// models/Assignment.js
const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  projectName: String,
  assignments: [
    {
      employee: String,
      tasks: [String],
      items: [String],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema, "assignments");

