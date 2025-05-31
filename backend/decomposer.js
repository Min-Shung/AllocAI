require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const DecomposedTask = require("./models/DecomposedTask");

const Project = mongoose.model(
  "Project",
  new mongoose.Schema({
    projectName: String,
    projectGoal: String,
    expectedTimeline: String,
    meetingNotes: String,
    createdAt: { type: Date, default: Date.now },
  })
);

const {
  AZURE_OPENAI_ENDPOINT,
  API_KEY,
  DEPLOYMENT_NAME,
  API_VERSION,
  MONGODB_URI = "mongodb://localhost:27017/taskmanager",
} = process.env;

async function callOpenAI(projectDescription) {
  const prompt = `
    你是一個軟體專案分析師，請將以下描述的專案內容拆解為層級結構，包含 Story、Task 與 Item 三層架構。
    請嚴格只回純 JSON 陣列格式，回傳內容格式如下：

    [
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

    請依據以下資訊進行任務拆解：
    【專案名稱】：${projectDescription.projectName}
    【專案目標】：${projectDescription.projectGoal}
    【預期時程】：${projectDescription.expectedTimeline}
    【會議紀錄】：${projectDescription.meetingNotes}
    `;

  const url = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, "")}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  const headers = {
    "Content-Type": "application/json",
    "api-key": API_KEY,
  };
  const data = {
    messages: [
      { role: "system", content: "你是一個任務分析專家。" },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  };

  const res = await axios.post(url, data, { headers });
  const reply = res.data.choices[0].message.content;

  // 解析 GPT 回傳的 JSON，容錯處理
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

async function runDecomposeModule() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ decomposer成功連線至 MongoDB");

    const db = mongoose.connection;
    db.on("disconnected", () => console.warn("⚠️ MongoDB 已中斷連線"));

    console.log("📡 從資料庫讀取最新專案...");
    const latestProject = await Project.findOne().sort({ createdAt: -1 });
    if (!latestProject) throw new Error("❌ 資料庫中找不到專案資料");

    console.log("🚀 發送任務拆解請求至 OpenAI...");
    const result = await callOpenAI(latestProject);
    await DecomposedTask.deleteMany({});
    await DecomposedTask.insertMany(result);

    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filepath = path.join(outputDir, "decomposed_tasks.json");
    fs.writeFileSync(filepath, JSON.stringify({ stories: result.stories }, null, 2));
    console.log("✅ 任務拆解完成，結果已存入資料庫並輸出至：", filepath);

    return result;
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
