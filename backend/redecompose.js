require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Project = require("./models/Project");
const Feedback = require("./models/Feedback");
const DecomposedTask = require("./models/DecomposedTask");

const {
  AZURE_OPENAI_ENDPOINT,
  API_KEY,
  DEPLOYMENT_NAME,
  API_VERSION,
  MONGODB_URI = "mongodb://localhost:27017/taskmanager",
} = process.env;

async function callOpenAI(messages) {
  const url = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  const headers = {
    "Content-Type": "application/json",
    "api-key": API_KEY,
  };
  const data = {
    messages,
    temperature: 0.3,
    max_tokens: 1500,
  };

  const res = await axios.post(url, data, { headers });
  const reply = res.data.choices[0].message.content;

  let jsonString;
  const match = reply.match(/```json\s*([\s\S]*?)```/i);
  
  if (match) {
    jsonString = match[1].trim();
  } else {
    try {
      JSON.parse(reply);
      jsonString = reply;
    } catch {
      throw new Error("GPT 回傳的格式無法解析為 JSON");
    }
  }
  return JSON.parse(jsonString);
}

function formatFeedback(feedback) {
  if (!feedback) return "無";
  return `- 名稱：${feedback.name}
- 類型：${feedback.type}
- 原因：${feedback.reason}${feedback.reason === "其他" && feedback.customReason ? `（${feedback.customReason}）` : ""}
- 時間：${feedback.timestamp.toISOString()}`;
}

// 整體重新拆分
async function decomposeProject(project, feedback, oldDecomposedTasks) {
  const prompt = `
你是一個軟體專案分析師，請將以下描述的專案內容拆解為層級結構，包含 Story、Task 與 Item 三層架構。請使用以下 JSON 格式回覆：

{
  "stories": [
    {
      "name": "Story名稱",
      "tasks": [
        {
          "name": "Task名稱",
          "items": ["子項目1", "子項目2"]
        }
      ]
    }
  ]
}

【專案名稱】：${project.projectName}
【專案目標】：${project.projectGoal}
【預期時程】：${project.expectedTimeline}
【會議紀錄】：${project.meetingNotes}
【最新使用者回饋】：
${formatFeedback(feedback)}
【先前拆分結果】：
${oldDecomposedTasks.length > 0 ? JSON.stringify(oldDecomposedTasks, null, 2) : "無"}
`;

  const messages = [
    { role: "system", content: "你是一個任務分析專家。" },
    { role: "user", content: prompt },
  ];

  return await callOpenAI(messages);
}

// 針對某個 story 重新拆分 task 和 item
async function decomposeStory(story, feedback) {
  const prompt = `
你是一個任務分析師，請根據以下 Story 的資訊，重新拆解出其底下的 Tasks 與每個 Task 的 Items。

請使用以下 JSON 格式回覆：
{
  "tasks": [
    {
      "name": "Task名稱",
      "items": ["子項目1", "子項目2"]
    }
  ]
}

【Story 名稱】：${story.name}
【使用者回饋】：
${formatFeedback(feedback)}
`;

  const messages = [
    { role: "system", content: "你是一個任務分析專家。" },
    { role: "user", content: prompt },
  ];

  return await callOpenAI(messages);
}

// 針對某個 task 重新拆分 item
async function decomposeTask(task, feedback) {
  const prompt = `
你是一個任務分析師，請根據以下 Task 的名稱與使用者回饋，重新拆解其底下的 Items。

請使用以下 JSON 格式回覆：
{
  "items": ["子項目1", "子項目2"]
}

【Task 名稱】：${task.name}
【使用者回饋】：
${formatFeedback(feedback)}
`;

  const messages = [
    { role: "system", content: "你是一個任務分析專家。" },
    { role: "user", content: prompt },
  ];

  return await callOpenAI(messages);
}

async function runDecomposeModule() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ 成功連線至 MongoDB");

    const latestProject = await Project.findOne().sort({ createdAt: -1 });
    if (!latestProject) throw new Error("❌ 找不到專案資料");

    const latestFeedback = await Feedback.findOne().sort({ timestamp: -1 });
    const allDecomposedTasks = await DecomposedTask.find().lean();

    if (!latestFeedback || latestFeedback.type === "project") {
      // 整體重新拆解
      console.log("🚀 執行整體任務拆解...");
      const result = await decomposeProject(latestProject, latestFeedback, allDecomposedTasks);
      await DecomposedTask.deleteMany({});
        console.log("🗑️ 已清除原有的 DecomposedTask 資料");

        // ✅ 再寫入新的任務拆解
        await Promise.all(result.stories.map(async (story) => {
        await DecomposedTask.create({
            name: story.name,
            tasks: story.tasks,
        });
        }));


      const outputDir = path.join(__dirname, "output");
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
      const filepath = path.join(outputDir, "decomposed_tasks.json");
      fs.writeFileSync(filepath, JSON.stringify({ stories: result.stories }, null, 2));
      console.log("✅ 拆解完成，結果輸出至：", filepath);
      return result;
    }

    // feedback 為 story 或 task 類型
    if (!mongoose.isValidObjectId(latestFeedback.againId)) {
    throw new Error("❌ againId 格式不正確");
    }
    const decomposeId = new mongoose.Types.ObjectId(latestFeedback.againId);
    const evaluation = await DecomposedTask.findById(decomposeId);
    if (!evaluation) throw new Error(`❌ 找不到對應的 DecomposedTask，ID: ${latestFeedback.againId}`);

    if (latestFeedback.type === "story") {
      console.log("🔧 執行 Story 拆解...");
      const result = await decomposeStory(evaluation, latestFeedback);
      await DecomposedTask.findByIdAndUpdate(latestFeedback.againId, {
        ...evaluation,
        tasks: result.tasks,
      });
      console.log("✅ Story 拆解更新完成");
      return result;
    }

    if (latestFeedback.type === "task") {
      console.log("🔧 執行 Task 拆解...");
      const result = await decomposeTask(evaluation, latestFeedback);
      await DecomposedTask.findByIdAndUpdate(latestFeedback.againId, {
        ...evaluation,
        items: result.items,
      });
      console.log("✅ Task 拆解更新完成");
      return result;
    }

    throw new Error("❌ 不支援的 feedback.type");

  } catch (error) {
    console.error("❌ runDecomposeModule 發生錯誤:", error.message);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("✅ MongoDB 連線已關閉");
  }
}

if (require.main === module) {
  runDecomposeModule().catch(() => process.exit(1));
}

module.exports = { runDecomposeModule };
