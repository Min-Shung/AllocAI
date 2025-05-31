// models/TaskEvaluation.js
const mongoose = require("mongoose");

const EvaluationSchema = new mongoose.Schema({
  description: String,
  stories: [
    {
      name: String,
      tasks: [
        {
          name: String,
          metrics: Object,
          items: [
            {
              name: String,
              metrics: Object,
            },
          ],
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.TaskEvaluation || mongoose.model("TaskEvaluation", EvaluationSchema);
