// models/DecomposedTask.js
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  name: String,
  tasks: [
    {
      name: String,
      items: [String],
    },
  ],
});

module.exports = mongoose.models.DecomposedTask || mongoose.model("DecomposedTask", TaskSchema, "decomposed_tasks");

